// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {USDPLNOracle} from "./USDPLNOracle.sol";
import {StabilskiToken} from "./StabilskiToken.sol";

contract VaultManager is ReentrancyGuard {
    error InvalidVault();
    error NotEnoughCollateral();
    error NotEnoughDebt();
    error VaultAlreadyExists();
    error UnderCollateralized();
    
  struct Vault {
  uint256 collateralAmount;
  address collateralType;
  uint256 debt;
}

struct CollateralConfig {
  address priceFeed; // Chainlink aggregator
  uint256 minCollateralRatio; // e.g., 150% in 1e18 format
  bool enabled;
}

    mapping(address => Vault) public vaults;
    mapping(address => CollateralConfig) public collateralConfigs;

    USDPLNOracle public usdPlnOracle;
    StabilskiToken public stabilskiToken;

modifier onlyWhitelistedCollateral(address tokenAddress) {
    if (collateralConfigs[tokenAddress].priceFeed == address(0)) {
        revert InvalidVault();
    }
    _;
}

constructor() {
  
}

function depositCollateral(address token, uint256 amount) external nonReentrant onlyWhitelistedCollateral(token) {
    if (amount == 0) {
        revert NotEnoughCollateral();
    }
    

    vaults[msg.sender].collateralAmount += amount;
    vaults[msg.sender].collateralType = token;
}

function mintPLST(uint256 amount) external nonReentrant {

    uint256 collateralAmountInUSD = (vaults[msg.sender].collateralAmount * collateralConfigs[vaults[msg.sender].collateralType].priceFeed) / 1e18;
    uint256 collateralAmountInPLN = collateralAmountInUSD * usdPlnOracle.plnUsdRate / 1e4;

    uint256 maxAllowedAmount = collateralAmountInPLN * collateralConfigs[vaults[msg.sender].collateralType].minCollateralRatio / 1e18;

if(collateralConfigs[vaults[msg.sender].collateralType].priceFeed == address(0)) {
        revert InvalidVault();
    }

    if(collateralConfigs[vaults[msg.sender].collateralType].enabled == false) {
        revert InvalidVault();
    }


    if(maxAllowedAmount < amount) {
        revert UnderCollateralized();
    }

   stabilskiToken.mint(msg.sender, amount);
    
    
   

}

function withDrawCollateral(address token, uint256 amount) external nonReentrant onlyWhitelistedCollateral(token) {
    if (amount == 0 || vaults[msg.sender].collateralAmount < amount) {
        revert NotEnoughCollateral();
    }

    if(vaults[msg.sender].collateralType != token) {
        revert InvalidVault();
    }
    vaults[msg.sender].collateralAmount -= amount;
}

function repayPLST(uint256 amount) external nonReentrant {


}

// The function is supposed to liquidate the vault
function liquidateVault(address liquidator) external nonReentrant {
  uint256 collateralAmount = vaults[liquidator].collateralAmount;

  uint256 collateralAmountInUSD = collateralAmount * getCollateralPrice(vaults[liquidator].collateralType) / 1e18;

  uint256 debtAmount = vaults[liquidator].debt;

    
}

function getCollateralPrice(address token) external view returns (uint256) {
AggregatorV3Interface priceFeed = AggregatorV3Interface(collateralTypes[token].priceFeed);
(, int256 answer,,,) = priceFeed.latestRoundData();
return uint256(answer);

}



}