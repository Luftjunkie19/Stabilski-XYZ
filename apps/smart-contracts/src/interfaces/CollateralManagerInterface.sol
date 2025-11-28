// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


interface CollateralManagerInterface {
function addCollateralType(address collateralToken, address priceFeed, uint256 minCollateralRatio) external;

function updateFeed(address token, address newPriceFeed, uint256 newMinCollateralRatio) external;

function updateCollateral(address collateralToken, address priceFeed, uint256 minCollateralRatio) external;

function toggleCollateral(address token) external;

function getTokenPrice(address token) external view returns(uint256);

function getTokenPriceFromPriceFeed(address priceFeedAddress) external view returns(uint256);

function getCollateralInfo(address token) external view returns (address, uint256, bool, uint256, uint256);

function getCollateralTokens() external view returns (address[] memory);

function getTheCollateralManagerOwner() external view returns (address);
}