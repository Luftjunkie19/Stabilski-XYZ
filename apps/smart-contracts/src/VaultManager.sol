// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

import {StabilskiTokenInterface} from "./interfaces/StabilskiTokenInterface.sol";
import {USDPLNOracleInterface} from "./interfaces/USDPLNOracleInterface.sol";

import {CollateralManagerInterface} from "./interfaces/CollateralManagerInterface.sol";

import {IERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {AggregatorV3Interface} from "../../lib/chainlink-brownie-contracts/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract VaultManager is ReentrancyGuard {
    error InvalidVault();
    error NotEnoughCollateral();
    error NotEnoughDebt();
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
  address collateralType;
  uint256 debt;
}

    mapping(address => Vault) public vaults;
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

constructor(address _usdPlnOracle, address _stabilskiToken, address _collateralManager) {
    usdPlnOracle = USDPLNOracleInterface(_usdPlnOracle);
    stabilskiToken = StabilskiTokenInterface(_stabilskiToken);
    collateralManager = CollateralManagerInterface(_collateralManager);
}

function depositCollateral(address token, uint256 amount) external nonReentrant onlyWhitelistedCollateral(token) {
(address priceFeed,,) = collateralManager.getCollateralInfo(token);

    if (amount == 0) {
        revert NotEnoughCollateral();
    }

    if(vaults[msg.sender].collateralAmount > 0) {
    revert VaultAlreadyExists();
}

    if(priceFeed == address(0)) {
        revert InvalidVault();
    }
    

    vaults[msg.sender].collateralAmount += amount;
    vaults[msg.sender].collateralType = token;
    vaultOwners.push(msg.sender);

    IERC20(token).transferFrom(msg.sender, address(this), amount);

    emit CollateralDeposited(msg.sender, token, amount);

}

function mintPLST(uint256 amount) external nonReentrant {

    uint256 collateralAmountInUSD = (vaults[msg.sender].collateralAmount * getCollateralPrice(vaults[msg.sender].collateralType)) / 1e18;
    uint256 collateralAmountInPLN = (collateralAmountInUSD * usdPlnOracle.getPLNPrice()) / 1e4;

    (address priceFeed, uint256 minCollateralRatio, bool enabled) = collateralManager.getCollateralInfo(vaults[msg.sender].collateralType);

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
   vaults[msg.sender].debt += amount;

emit StabilskiTokenMinted(msg.sender, amount);

}

function repayPLST(uint256 amount) external nonReentrant {
    if(amount == 0 || amount > stabilskiToken.balanceOf(msg.sender)) {
        revert NotEnoughPLST();
    }

    if(vaults[msg.sender].debt < amount) {
        revert NotEnoughDebt();
    }

    vaults[msg.sender].debt -= amount;
    stabilskiToken.burn(msg.sender, amount);
    emit DebtRepaid(msg.sender, amount, address(stabilskiToken));
}

function withdrawCollateral(address token, uint256 amount) external nonReentrant onlyWhitelistedCollateral(token) {

    if(amount == 0 || amount > vaults[msg.sender].collateralAmount) {
        revert NotEnoughCollateral();
    }

    vaults[msg.sender].collateralAmount -= amount;
    IERC20(token).transferFrom(address(this), msg.sender, amount);

    emit CollateralWithdrawn(msg.sender, token, amount);
}


// The function is supposed to liquidate the vault
function liquidateVault(address vaultOwner) external nonReentrant {

    if(vaults[vaultOwner].debt == 0) {
        revert InvalidVault();
    }

    if(vaults[vaultOwner].collateralAmount == 0) {
        revert InvalidVault();
    }

if(vaults[vaultOwner].collateralType == address(0)) {
        revert InvalidVault();
    }

    (, uint256 minCollateralRatio,) = collateralManager.getCollateralInfo(vaults[vaultOwner].collateralType);

  uint256 collateralAmountInUSD = vaults[vaultOwner].collateralAmount * getCollateralPrice(vaults[vaultOwner].collateralType) / 1e18;

  uint256 collateralAmountInPLN = collateralAmountInUSD * usdPlnOracle.getPLNPrice() / 1e4;

  uint256 maxAllowedAmount = collateralAmountInPLN * minCollateralRatio / 1e18;

  uint256 debtAmount = vaults[vaultOwner].debt;

   if (debtAmount <= maxAllowedAmount) {
       revert NotEnoughDebt();
    }

    // Transfer stablecoin from msg.sender to protocol to repay the debt
    stabilskiToken.transferFrom(msg.sender, address(this), vaults[vaultOwner].debt);

  // Assuming getPLNPrice() returns USD per 1 PLN * 1e4
uint256 debtInUSD = (debtAmount * 1e4) / usdPlnOracle.getPLNPrice(); // scale up first!

// Step 2: Convert USD to collateral
uint256 collateralPrice = getCollateralPrice(vaults[vaultOwner].collateralType); // in USD * 1e18

uint256 debtAmountFromCollateral = (debtInUSD * 1e18) / collateralPrice;

 // Calculate bounty (e.g. 5%)
    uint256 bountyCollateral = (debtAmountFromCollateral * 5) / 100;

    if(debtAmountFromCollateral + bountyCollateral > vaults[vaultOwner].collateralAmount) {
        revert NotEnoughCollateral();
    }

    IERC20(vaults[vaultOwner].collateralType).transfer(msg.sender, debtAmountFromCollateral + bountyCollateral);
    
stabilskiToken.burn(vaultOwner, debtAmount);

  delete vaults[vaultOwner];
  
  emit VaultLiquidated(vaultOwner, msg.sender, vaults[vaultOwner].debt, bountyCollateral);

    
}

function getCollateralPrice(address token) public view returns (uint256) {
(address priceFeed,,) = collateralManager.getCollateralInfo(token);

AggregatorV3Interface priceFeedAgreagator = AggregatorV3Interface(priceFeed);
(, int256 answer,,,) = priceFeedAgreagator.latestRoundData();
uint8 decimals = priceFeedAgreagator.decimals();
return uint256(answer) * 1e18 / (10 ** decimals);

}


function getVaultHealthFactor(address vaultOwner, address token) public view returns (uint256) {

    if(vaults[vaultOwner].debt == 0 || vaults[vaultOwner].collateralAmount == 0 || vaults[vaultOwner].collateralType == address(0)) {
        return 0;
    }



    (, uint256 minCollateralRatio,) = collateralManager.getCollateralInfo(token);
    uint256 collateralAmountInUSD = vaults[vaultOwner].collateralAmount * getCollateralPrice(token) / 1e18;
    uint256 collateralAmountInPLN = collateralAmountInUSD * usdPlnOracle.getPLNPrice() / 1e4;
    uint256 maxAllowedAmount = collateralAmountInPLN * minCollateralRatio / 1e18;
    uint256 debtAmount = vaults[vaultOwner].debt;
    return (debtAmount / maxAllowedAmount) * 1e18;
}
}