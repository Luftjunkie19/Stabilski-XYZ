// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {AggregatorV3Interface} from "../../lib/chainlink-brownie-contracts/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract CollateralManager {
error InvalidCollateralToken();
error InvalidPriceFeed();
error InvalidMinCollateralRatio();
error CollateralAlreadyExists();
error TokenPriceNotAvailable();

struct CollateralInfo{
    address priceFeed;
    uint256 minCollateralRatio;
    bool isActive;
}

mapping(address => CollateralInfo) public collateralTypes;
address[] public collateralTokens;
constructor(address[] memory _collateralTokens, address[] memory _priceFeeds, uint256[] memory _minCollateralRatios) {

    for(uint256 i = 0; i < _collateralTokens.length; i++) {
        collateralTypes[_collateralTokens[i]] = CollateralInfo({
            priceFeed: _priceFeeds[i],
            minCollateralRatio: _minCollateralRatios[i],
            isActive: true
        });
        collateralTokens.push(_collateralTokens[i]);
    }

}

modifier onlyActiveCollateral(address token) {
    if (!collateralTypes[token].isActive || collateralTypes[token].priceFeed == address(0)) {
        revert TokenPriceNotAvailable();
    }
    _;
}

function addCollateralType(
    address collateralToken,
    address priceFeed,
    uint256 minCollateralRatio
) external {
    collateralTypes[collateralToken] = CollateralInfo({
        priceFeed: priceFeed,
        minCollateralRatio: minCollateralRatio,
        isActive: true
    });
    }

function updateFeed(address token, address newPriceFeed, uint256 newMinCollateralRatio) external {
  
    if (collateralTypes[token].priceFeed == address(0)) {
        revert InvalidCollateralToken();
    }
    if (collateralTypes[token].minCollateralRatio == 0) {
        revert InvalidMinCollateralRatio();
    }
    if (!collateralTypes[token].isActive) {
        revert CollateralAlreadyExists();
    }
    if (newPriceFeed == address(0)) {
        revert InvalidPriceFeed();
    }

    collateralTypes[token] = CollateralInfo({
        priceFeed: newPriceFeed,
        minCollateralRatio: newMinCollateralRatio,
        isActive: true});
    }

function updateCollateral(
    address collateralToken,
    address priceFeed,
    uint256 minCollateralRatio
) external {
    if (collateralToken == address(0)) {
        revert InvalidCollateralToken();
    }
    if (priceFeed == address(0)) {
        revert InvalidPriceFeed();
    }
    if (minCollateralRatio == 0) {
        revert InvalidMinCollateralRatio();
    }

    collateralTypes[collateralToken] = CollateralInfo({
        priceFeed: priceFeed,
        minCollateralRatio: minCollateralRatio,
        isActive: true
    });
}

function toggleCollateral(address token) external{
    CollateralInfo storage collateral = collateralTypes[token];
    if (collateral.priceFeed == address(0)) {
        revert InvalidCollateralToken();
    }
    collateral.isActive = !collateral.isActive;
}

function getTokenPrice(address token) public view onlyActiveCollateral(token) returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(collateralTypes[token].priceFeed);
           (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
uint8 decimals = priceFeed.decimals();
        return uint256(answer) * 1e18 / (10 ** decimals);
    }

function getCollateralInfo(address token) public view onlyActiveCollateral(token) returns (address, uint256, bool) {
    return (collateralTypes[token].priceFeed, collateralTypes[token].minCollateralRatio, collateralTypes[token].isActive);
}

function getCollateralTokens() public view returns (address[] memory) {
    return collateralTokens;
}

}

