// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

import {StabilskiTokenInterface} from "./interfaces/StabilskiTokenInterface.sol";
import {USDPLNOracleInterface} from "./interfaces/USDPLNOracleInterface.sol";

import {CollateralManagerInterface} from "./interfaces/CollateralManagerInterface.sol";
import {SafeERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {AggregatorV3Interface} from "../../lib/chainlink-brownie-contracts/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract VaultManager is ReentrancyGuard {
    using SafeERC20 for IERC20;
    error InvalidVault();
    error NotEnoughCollateral();
    error NotEnoughDebt();
    error InvalidCollateralToken();
    error VaultAlreadyExists();
    error UnderCollateralized();
    error NotEnoughPLST();

    event VaultLiquidated(address vaultOwner, address liquidator, uint256 debtAmount, uint256 collateralAmount);

    event CollateralDeposited(address vaultOwner, address token, uint256 amount);
    event CollateralWithdrawn(address vaultOwner, address token, uint256 amount);
    event DebtRepaid(address vaultOwner, uint256 amount, address token);
    event StabilskiTokenMinted(address vaultOwner, uint256 amount);


  struct Vault {
  uint256 collateralAmount;
  address collateralTypeToken;
  uint256 debt;
}

// User ==> Token ==> Vault
    mapping(address => mapping(address => Vault)) public vaults;
    address[] vaultOwners;
  

    USDPLNOracleInterface public usdPlnOracle;
    StabilskiTokenInterface public stabilskiToken;
    CollateralManagerInterface public collateralManager;

modifier onlyWhitelistedCollateral(address tokenAddress) {
    (address priceFeed, uint256 minCollateralRatio, bool enabled) = collateralManager.getCollateralInfo(tokenAddress);
    if (priceFeed == address(0)) {
        revert InvalidVault();
    }
    _;
}

modifier NoEnoughAmount(uint256 tokenAmount, address tokenAddress) {
    if(tokenAmount == 0 || IERC20(tokenAddress).balanceOf(msg.sender) < tokenAmount) {
        revert NotEnoughCollateral();
    }
    _;
}

modifier noCollateralAmount(address tokenAddress) {
        if(vaults[msg.sender][tokenAddress].collateralAmount > 0) {
    revert VaultAlreadyExists();
}
_;
}

constructor(address _usdPlnOracle, address _stabilskiToken, address _collateralManager) {
    usdPlnOracle = USDPLNOracleInterface(_usdPlnOracle);
    stabilskiToken = StabilskiTokenInterface(_stabilskiToken);
    collateralManager = CollateralManagerInterface(_collateralManager);
}

function depositCollateral(address token, uint256 amount) external nonReentrant onlyWhitelistedCollateral(token) NoEnoughAmount(amount, token) noCollateralAmount(token) {
(address priceFeed,,) = collateralManager.getCollateralInfo(token);

    if(priceFeed == address(0)) {
        revert InvalidCollateralToken();
    }
    

    IERC20(token).transferFrom(msg.sender, address(this), amount);
    vaults[msg.sender][token].collateralAmount += amount;
    vaults[msg.sender][token].collateralTypeToken = token;
    vaultOwners.push(msg.sender);

    emit CollateralDeposited(msg.sender, token, amount);

}

function mintPLST(address collateralToken, uint256 amount) external nonReentrant NoEnoughAmount(amount, collateralToken){
    (address priceFeed, uint256 minCollateralRatio, bool enabled) = collateralManager.getCollateralInfo(vaults[msg.sender][collateralToken].collateralTypeToken);

    uint256 collateralAmountInUSD = (vaults[msg.sender][collateralToken].collateralAmount * collateralManager.getTokenPrice(priceFeed)) / 1e18;
    uint256 collateralAmountInPLN = (collateralAmountInUSD * usdPlnOracle.getPLNPrice()) / 1e4;


    uint256 maxAllowedAmount = collateralAmountInPLN * minCollateralRatio / 1e18;

if(priceFeed == address(0)) {
        revert InvalidVault();
    }

    if(enabled == false) {
        revert InvalidVault();
    }


    if(maxAllowedAmount < amount) {
        revert UnderCollateralized();
    }

   stabilskiToken.mint(msg.sender, amount);
   vaults[msg.sender][collateralToken].debt += amount;

emit StabilskiTokenMinted(msg.sender, amount);

}

function repayPLST(address collateralToken, uint256 amount) external nonReentrant {
    if(amount == 0 || amount > stabilskiToken.balanceOf(msg.sender)) {
        revert NotEnoughPLST();
    }

    if(vaults[msg.sender][collateralToken].debt < amount) {
        revert NotEnoughDebt();
    }

    vaults[msg.sender][collateralToken].debt -= amount;
    stabilskiToken.burn(msg.sender, amount);
    emit DebtRepaid(msg.sender, amount, address(stabilskiToken));
}

function withdrawCollateral(address token, uint256 amount) external nonReentrant onlyWhitelistedCollateral(token) {

    if(amount == 0 || amount > vaults[msg.sender][token].collateralAmount) {
        revert NotEnoughCollateral();
    }

    vaults[msg.sender][token].collateralAmount -= amount;
    IERC20(token).transferFrom(address(this), msg.sender, amount);

    emit CollateralWithdrawn(msg.sender, token, amount);
}


// The function is supposed to liquidate the vault
function liquidateVault(address vaultOwner, address token) external nonReentrant {

    if(vaults[vaultOwner][token].debt == 0) {
        revert InvalidVault();
    }

    if(vaults[vaultOwner][token].collateralAmount == 0) {
        revert InvalidVault();
    }

if(vaults[vaultOwner][token].collateralTypeToken == address(0)) {
        revert InvalidVault();
    }

    (, uint256 minCollateralRatio,) = collateralManager.getCollateralInfo(vaults[vaultOwner][token].collateralTypeToken);

  uint256 collateralAmountInUSD = vaults[vaultOwner][token].collateralAmount * collateralManager.getTokenPrice(vaults[vaultOwner][token].collateralTypeToken) / 1e18;

  uint256 collateralAmountInPLN = collateralAmountInUSD * usdPlnOracle.getPLNPrice() / 1e4;

  uint256 maxAllowedAmount = collateralAmountInPLN * minCollateralRatio / 1e18;

  uint256 debtAmount = vaults[vaultOwner][token].debt;

   if (debtAmount <= maxAllowedAmount) {
       revert NotEnoughDebt();
    }

    // Transfer stablecoin from msg.sender to protocol to repay the debt
    IERC20(address(stabilskiToken)).transferFrom(msg.sender, address(this), debtAmount);

  // Assuming getPLNPrice() returns USD per 1 PLN * 1e4
uint256 debtInUSD = (debtAmount * 1e4) / usdPlnOracle.getPLNPrice(); // scale up first!

// Step 2: Convert USD to collateral
uint256 collateralPrice = collateralManager.getTokenPrice(vaults[vaultOwner][token].collateralTypeToken); // in USD * 1e18

uint256 debtAmountFromCollateral = (debtInUSD * 1e18) / collateralPrice;

 // Calculate bounty (e.g. 5%)
    uint256 bountyCollateral = (debtAmountFromCollateral * 5) / 100;

    if(debtAmountFromCollateral + bountyCollateral > vaults[vaultOwner][token].collateralAmount) {
        revert NotEnoughCollateral();
    }

    IERC20(vaults[vaultOwner][token].collateralTypeToken).transfer(msg.sender, debtAmountFromCollateral + bountyCollateral);
    
stabilskiToken.burn(vaultOwner, debtAmount);

  delete vaults[vaultOwner][token];
  
  emit VaultLiquidated(vaultOwner, msg.sender, vaults[vaultOwner][token].debt, bountyCollateral);

    
}




function getVaultHealthFactor(address vaultOwner, address token) public view returns (uint256) {

    if(vaults[vaultOwner][token].debt == 0 || vaults[vaultOwner][token].collateralAmount == 0 || vaults[vaultOwner][token].collateralTypeToken == address(0)) {
        return 0;
    }

    (, uint256 minCollateralRatio,) = collateralManager.getCollateralInfo(token);
    uint256 collateralAmountInUSD = vaults[vaultOwner][token].collateralAmount * collateralManager.getTokenPrice(token) / 1e18;
    uint256 collateralAmountInPLN = collateralAmountInUSD * usdPlnOracle.getPLNPrice() / 1e4;
    uint256 maxAllowedAmount = collateralAmountInPLN * minCollateralRatio / 1e18;
    uint256 debtAmount = vaults[vaultOwner][token].debt;
    return (debtAmount / maxAllowedAmount) * 1e18;
}
}