// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20Mock} from "../src/interfaces/ERC20Mock.sol";
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
    error OverCollateralized();
    error NotEnoughPLST();
    error InvalidAllowance();
    error LiquidatorCannotBeVaultOwner();

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
    address[] borrowers;
    USDPLNOracleInterface public usdPlnOracle;
    StabilskiTokenInterface public stabilskiToken;
    CollateralManagerInterface public collateralManager;
    uint256 constant decimalPointsForUsdPlnRate= 1e4;
    uint256 constant percentageConverter = 100;
    uint256 constant decimalPointsNormalizer= 1e18;
    uint8 constant liquidationBuffer= 85;

modifier onlyWhitelistedCollateral(address tokenAddress) {
    (address priceFeed, uint256 minCollateralRatio, bool enabled,,) = collateralManager.getCollateralInfo(tokenAddress);
    if (priceFeed == address(0)) {
        revert InvalidVault();
    }
    _;
}

modifier HasSufficientWalletBalance (uint256 tokenAmount, address tokenAddress) {
    if(_getMaxBorrowableStabilskiTokens(msg.sender, tokenAddress) < tokenAmount) {
        revert NotEnoughCollateral();
    }
    _;
}

modifier NoReadyForLiquidation(address vaultOwner, address tokenAddress) {

    if(msg.sender == vaultOwner) {
        revert LiquidatorCannotBeVaultOwner();
    }

   bool healthFactor = isLiquidatable(vaultOwner, tokenAddress);
    if(!healthFactor) {
        revert OverCollateralized();
    }
    _;
}

modifier CannotWithdrawCollateral(address vaultOwner, address tokenAddress) {
    (, uint256 minCollateralRatio,,,) = collateralManager.getCollateralInfo(tokenAddress);
if(getVaultHealthFactor(msg.sender, tokenAddress) < minCollateralRatio) {
    revert UnderCollateralized();
}
_;
}


constructor(address _usdPlnOracle, address _stabilskiToken, address _collateralManager) {
    usdPlnOracle = USDPLNOracleInterface(_usdPlnOracle);
    stabilskiToken = StabilskiTokenInterface(_stabilskiToken);
    collateralManager = CollateralManagerInterface(_collateralManager);
}

function isInTheArray(address soughtAddr) internal returns(bool) {

 for(uint256 index=0; index < borrowers.length; index++){
        if(borrowers[index] == soughtAddr) {
            return true;
        }
    }

    return false;
}

function depositCollateral(address token, uint256 amount) external nonReentrant onlyWhitelistedCollateral(token) {
    IERC20(token).transferFrom(msg.sender, address(this), amount);
    vaults[msg.sender][token].collateralAmount += amount;
    vaults[msg.sender][token].collateralTypeToken = token;
    
    if(!isInTheArray(msg.sender)){
    borrowers.push(msg.sender);
    }

    emit CollateralDeposited(msg.sender, token, amount);

}

function mintPLST(address collateralToken, uint256 amount) external nonReentrant HasSufficientWalletBalance(amount, collateralToken) {
    Vault storage vault = vaults[msg.sender][collateralToken];
    (, uint256 minCollateralRatio,,,) = collateralManager.getCollateralInfo(vault.collateralTypeToken);


    // Proper collateral-to-debt comparison
    if (getVaultHealthFactor(msg.sender, collateralToken) < minCollateralRatio) {
        revert UnderCollateralized();
    }

    stabilskiToken.mint(msg.sender, amount);
    vault.debt += amount;

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

function withdrawCollateral(address token, uint256 amount) external nonReentrant onlyWhitelistedCollateral(token) CannotWithdrawCollateral(msg.sender, token) {

if(amount == 0 || amount > vaults[msg.sender][token].collateralAmount) {
        revert NotEnoughCollateral();
    }
    
  if(!getIsHealthyAfterWithdrawal(amount, token)) {
        revert UnderCollateralized();
    }

    vaults[msg.sender][token].collateralAmount -= amount;
    IERC20(token).safeTransfer(msg.sender, amount);

    emit CollateralWithdrawn(msg.sender, token, amount);
}


// The function is supposed to liquidate the vault
function liquidateVault(address vaultOwner, address token) external nonReentrant NoReadyForLiquidation(vaultOwner, token) {

    if(vaults[vaultOwner][token].debt == 0) {
        revert InvalidVault();
    }

    if(vaults[vaultOwner][token].collateralAmount == 0) {
        revert InvalidVault();
    }

if(vaults[vaultOwner][token].collateralTypeToken == address(0)) {
        revert InvalidVault();
    }

  uint256 debtAmount = vaults[vaultOwner][token].debt;

  if(debtAmount > stabilskiToken.balanceOf(msg.sender)) {
        revert NotEnoughPLST();
    }

    // Transfer stablecoin from msg.sender to protocol to repay the debt
    stabilskiToken.transferFrom(msg.sender, address(this), debtAmount);

    stabilskiToken.approve(address(this), debtAmount);

    stabilskiToken.burn(address(this), debtAmount);

  // Assuming getPLNPrice() returns USD per 1 PLN * 1e4
uint256 debtInUSD = (debtAmount * decimalPointsForUsdPlnRate) / usdPlnOracle.getPLNPrice(); // scale up first!

// Step 2: Convert USD to collateral
uint256 collateralPrice = collateralManager.getTokenPrice(vaults[vaultOwner][token].collateralTypeToken); 

// Step 3: Take amount debt and convert it to collateral amount
uint256 debtAmountFromCollateral = (debtInUSD * decimalPointsNormalizer) / collateralPrice;

    (,,,uint256 liquidationReward, uint256 punishmentPercentage) = collateralManager.getCollateralInfo(token);

 // Calculate bounty (e.g. 5%)
    uint256 bountyCollateral = (debtAmountFromCollateral * liquidationReward) / percentageConverter;

    uint256 punishmentFromCollateral = (debtAmountFromCollateral * punishmentPercentage) / percentageConverter;

    if(debtAmountFromCollateral + bountyCollateral > vaults[vaultOwner][token].collateralAmount) {
        revert NotEnoughCollateral();
    }

    IERC20(vaults[vaultOwner][token].collateralTypeToken).safeTransfer(msg.sender, debtAmountFromCollateral + bountyCollateral);

    

uint256 originalDebt = vaults[vaultOwner][token].debt;
uint256 totalCollateralUsed = debtAmountFromCollateral + bountyCollateral + punishmentFromCollateral;
uint256 remainingCollateral = vaults[vaultOwner][token].collateralAmount - totalCollateralUsed;

if (remainingCollateral > 0) {
    IERC20(vaults[vaultOwner][token].collateralTypeToken).safeTransfer(vaultOwner, remainingCollateral);
}

   delete vaults[vaultOwner][token];
  
  emit VaultLiquidated(vaultOwner, msg.sender, originalDebt, bountyCollateral);

}


function getVaultHealthFactor(address vaultOwner, address token) public view returns (uint256) {

    if(vaults[vaultOwner][token].collateralAmount == 0 || vaults[vaultOwner][token].collateralTypeToken == address(0)) {
        return 0;
    }
    
    uint256 collateralAmountInUSD = vaults[vaultOwner][token].collateralAmount * collateralManager.getTokenPrice(token) / decimalPointsNormalizer;
    uint256 collateralAmountInPLN = collateralAmountInUSD * usdPlnOracle.getPLNPrice() / decimalPointsForUsdPlnRate;

    uint256 debtAmount = vaults[vaultOwner][token].debt;

if (debtAmount == 0) return type(uint256).max;

    return  (collateralAmountInPLN / debtAmount) * decimalPointsNormalizer;
}

function getFlawedHealthFactor(address vaultOwner, address token) public view returns (uint256) {
    
    if(vaults[vaultOwner][token].collateralAmount == 0 || vaults[vaultOwner][token].collateralTypeToken == address(0)) {
        return 0;
    }
    
    uint256 collateralAmountInUSD = vaults[vaultOwner][token].collateralAmount * collateralManager.getTokenPrice(token) / decimalPointsNormalizer;
    uint256 collateralAmountInPLN = ((collateralAmountInUSD * usdPlnOracle.getPLNPrice() / decimalPointsForUsdPlnRate) * 65) / 100;

    uint256 debtAmount = vaults[vaultOwner][token].debt;

if (debtAmount == 0) return type(uint256).max;

    return  (collateralAmountInPLN / debtAmount) * decimalPointsNormalizer;
}


function getIsHealthyAfterWithdrawal(uint256 amount, address token) public view returns (bool) {
     uint256 collateralAmountAfterWithdrawal = vaults[msg.sender][token].collateralAmount - amount;

    (, uint256 minCollateralRatio,,,)=collateralManager.getCollateralInfo(vaults[msg.sender][token].collateralTypeToken);
    uint256 collateralAmountInUSD = collateralAmountAfterWithdrawal * collateralManager.getTokenPrice(token) / decimalPointsNormalizer;
    uint256 collateralAmountInPLN = collateralAmountInUSD * usdPlnOracle.getPLNPrice() / decimalPointsForUsdPlnRate;

    uint256 debtAmount = vaults[msg.sender][token].debt;

    if (debtAmount == 0) return true;

   uint256 healthFactor = (collateralAmountInPLN / debtAmount) * decimalPointsNormalizer;

    return healthFactor > minCollateralRatio;
}


function isLiquidatable(address vaultOwner, address token) public view returns (bool) {
    uint256 healthFactor = getFlawedHealthFactor(vaultOwner, token);
    (, uint256 minCollateralRatio,,,) = collateralManager.getCollateralInfo(token);
    
    // Apply a 15% liquidation threshold buffer
    uint256 liquidationThreshold = (minCollateralRatio * liquidationBuffer) / 100;

    return healthFactor < liquidationThreshold;
}

function getCollateralValue(address owner, address token) external view returns (uint256 inPLN){
       return (((vaults[owner][token].collateralAmount * collateralManager.getTokenPrice(token)) / decimalPointsNormalizer) * usdPlnOracle.getPLNPrice()) / decimalPointsForUsdPlnRate;
}


function _getCollateralValue(address owner, address token) private view returns (uint256 inPLN){
    return (((vaults[owner][token].collateralAmount * collateralManager.getTokenPrice(token)) / decimalPointsNormalizer) * usdPlnOracle.getPLNPrice()) / decimalPointsForUsdPlnRate;
}

function getMaxBorrowableStabilskiTokens(address owner, address token) external view returns (uint256 amount){
    uint256 collateralValue = _getCollateralValue(owner, token);
    (, uint256 minCollateralRatio,,,) = collateralManager.getCollateralInfo(token);
    uint256 maxBorrowable = (collateralValue / minCollateralRatio) * decimalPointsNormalizer;
    return maxBorrowable;
}

function _getMaxBorrowableStabilskiTokens(address owner, address token) internal view returns (uint256 amount){
    uint256 collateralValue = _getCollateralValue(owner, token);
    (, uint256 minCollateralRatio,,,) = collateralManager.getCollateralInfo(token);
    uint256 maxBorrowable = (collateralValue / minCollateralRatio) * decimalPointsNormalizer;
    return maxBorrowable;
}

function getVaultInfo(address owner, address token) external view returns (uint256 collateralAmount, uint256 debt, address collateralToken, uint256 healthFactor){
    return (vaults[owner][token].collateralAmount, vaults[owner][token].debt, vaults[owner][token].collateralTypeToken, getVaultHealthFactor(owner, token));
}

function getAllBorrowers() external returns (address[] memory){
    return borrowers;
}


}