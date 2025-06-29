// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {USDPLNOracle} from "./USDPLNOracle.sol";
import {StabilskiToken} from "./StabilskiToken.sol";

import {CollateralManager} from "./CollateralManager.sol";

import {AggregatorV3Interface} from "../../lib/chainlink-brownie-contracts/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract VaultManager is ReentrancyGuard {
    error InvalidVault();
    error NotEnoughCollateral();
    error NotEnoughDebt();
    error VaultAlreadyExists();
    error UnderCollateralized();
    error NotEnoughPLST();
    
  struct Vault {
  uint256 collateralAmount;
  address collateralType;
  uint256 debt;
}

    mapping(address => Vault) public vaults;
  

    USDPLNOracle public usdPlnOracle;
    StabilskiToken public stabilskiToken;
    CollateralManager public collateralManager;

modifier onlyWhitelistedCollateral(address tokenAddress) {
    (address priceFeed, uint256 minCollateralRatio, bool enabled) = collateralManager.collateralTypes(tokenAddress);
    if (priceFeed == address(0)) {
        revert InvalidVault();
    }
    _;
}

constructor(address _usdPlnOracle, address _stabilskiToken) {
    usdPlnOracle = USDPLNOracle(_usdPlnOracle);
    stabilskiToken = StabilskiToken(_stabilskiToken);
}

function depositCollateral(address token, uint256 amount) external nonReentrant onlyWhitelistedCollateral(token) {
(address priceFeed,,) = collateralManager.collateralTypes(token);

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
}

function mintPLST(uint256 amount) external nonReentrant {

    uint256 collateralAmountInUSD = (vaults[msg.sender].collateralAmount * getCollateralPrice(vaults[msg.sender].collateralType)) / 1e18;
    uint256 collateralAmountInPLN = (collateralAmountInUSD * usdPlnOracle.getPLNPrice()) / 1e4;

    (address priceFeed, uint256 minCollateralRatio, bool enabled) = collateralManager.collateralTypes(vaults[msg.sender].collateralType);

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
}

function withdrawCollateral(address token, uint256 amount) external nonReentrant onlyWhitelistedCollateral(token) {

    if(amount == 0 || amount > vaults[msg.sender].collateralAmount) {
        revert NotEnoughCollateral();
    }

    vaults[msg.sender].collateralAmount -= amount;
}


// The function is supposed to liquidate the vault
function liquidateVault(address liquidator) external nonReentrant {
    (, uint256 minCollateralRatio,) = collateralManager.collateralTypes(vaults[liquidator].collateralType);

  uint256 collateralAmountInUSD = vaults[liquidator].collateralAmount * getCollateralPrice(vaults[liquidator].collateralType) / 1e18;

  uint256 collateralAmountInPLN = collateralAmountInUSD * usdPlnOracle.getPLNPrice() / 1e4;

  uint256 maxAllowedAmount = collateralAmountInPLN * minCollateralRatio / 1e18;

  uint256 debtAmount = vaults[liquidator].debt;

  if(maxAllowedAmount < debtAmount) {
  // Liquidate the vault
  delete vaults[liquidator];
  }

    
}

function getCollateralPrice(address token) public view returns (uint256) {
(address priceFeed,,) = collateralManager.collateralTypes(token);

AggregatorV3Interface priceFeedAgreagator = AggregatorV3Interface(priceFeed);
(, int256 answer,,,) = priceFeedAgreagator.latestRoundData();
uint8 decimals = priceFeedAgreagator.decimals();
return uint256(answer) * 1e18 / (10 ** decimals);

}

}