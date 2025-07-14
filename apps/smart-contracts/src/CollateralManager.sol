// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {AggregatorV3Interface} from "../../lib/chainlink-brownie-contracts/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract CollateralManager {
error InvalidCollateralToken();
error InvalidPriceFeed();
error InvalidMinCollateralRatio();
error CollateralAlreadyExists();
error TokenPriceNotAvailable();
error NotAllowedChain();

struct CollateralInfo{
    address priceFeed;
    uint256 minCollateralRatio;
    bool isActive;
    uint256 liquidationBonus;
    uint256 punishment;
}
// Token ==> CollateralInfo
mapping(address => CollateralInfo) public collateralTypes;

// Chain ==> CollateralTokens
mapping(uint256=>address[]) public collateralTokens;
constructor(address[] memory _collateralTokens, address[] memory _priceFeeds, uint256[] memory _minCollateralRatios)  {

 for(uint256 i = 0; i < _collateralTokens.length; i++) {
        collateralTypes[_collateralTokens[i]] = CollateralInfo({
            priceFeed: _priceFeeds[i],
            minCollateralRatio: _minCollateralRatios[i],
            isActive: true,
            liquidationBonus: 5,
            punishment: 3
        });
        collateralTokens[block.chainid].push(_collateralTokens[i]);
    }

}

modifier onlyActiveCollateral(address token) {
    if (!collateralTypes[token].isActive || collateralTypes[token].priceFeed == address(0)) {
        revert TokenPriceNotAvailable();
    }
    _;
}

modifier onlyAllowedChains() {
   if(block.chainid != 11155111 && block.chainid != 421614){
        revert NotAllowedChain();
    }
    _;
}

modifier onlyExistingCollateral(address token){
if(collateralTypes[token].priceFeed == address(0) || collateralTypes[token].minCollateralRatio == 0) {
    revert InvalidCollateralToken();
}
_;
}



function addCollateralType(
    address collateralToken,
    address priceFeed,
    uint256 minCollateralRatio,
    uint256 liquidationBonus,
    uint256 punishment
) external {
    collateralTypes[collateralToken] = CollateralInfo({
        priceFeed: priceFeed,
        minCollateralRatio: minCollateralRatio,
        isActive: true,
         liquidationBonus: liquidationBonus,
            punishment: punishment
    });
    }

function updateCollateral(
    address collateralToken,
    address priceFeed,
    uint256 minCollateralRatio
) external onlyExistingCollateral(collateralToken) {
   

    collateralTypes[collateralToken].minCollateralRatio = minCollateralRatio;
    collateralTypes[collateralToken].priceFeed = priceFeed;
}

function toggleCollateral(address token) external{
    
    if (collateralTypes[token].priceFeed == address(0)) {
        revert InvalidCollateralToken();
    }
   collateralTypes[token].isActive = !collateralTypes[token].isActive;
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

function getCollateralInfo(address token) public view onlyActiveCollateral(token) returns (address, uint256, bool, uint256, uint256) {
    return (collateralTypes[token].priceFeed, collateralTypes[token].minCollateralRatio, collateralTypes[token].isActive, collateralTypes[token].liquidationBonus, collateralTypes[token].punishment);
}

function getCollateralTokens() public view onlyAllowedChains returns (address[] memory) {
    return collateralTokens[block.chainid];
}


}

