// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

contract VaultManager is ReentrancyGuard {
    error InvalidVault();
    error NotEnoughCollateral();
    error NotEnoughDebt();
    error VaultAlreadyExists();
    
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


}