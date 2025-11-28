// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {AggregatorV3Interface} from "../lib/chainlink-brownie-contracts/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

import {AccessControl} from
    "../lib/ccip/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/access/AccessControl.sol";

contract CollateralManager is AccessControl {
error InvalidCollateralToken();
error CollateralAlreadyExists();
error TokenPriceNotAvailable();
error TooLowMinCollateralRatio(uint256 ratioProvided);
error InvalidUpdateData();
error IneligibleSender(address sender);

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

uint256 private constant liquidationBonusPercentage = 5;
uint256 private constant punishmentPercentage = 3;

uint256 private constant minimalCollatarealRatio=125e16;
address private collateralManagerOwner;

bytes32 private constant CONTROLLER_ROLE = keccak256("CONTROLLER_ROLE"); 


constructor(address[] memory _collateralTokens, address[] memory _priceFeeds, uint256[] memory _minCollateralRatios)  {

 for(uint256 i = 0; i < _collateralTokens.length; i++) {
        collateralTypes[_collateralTokens[i]] = CollateralInfo({
            priceFeed: _priceFeeds[i],
            minCollateralRatio: _minCollateralRatios[i],
            isActive: true,
            liquidationBonus: liquidationBonusPercentage,
            punishment: punishmentPercentage
        });
        collateralTokens[block.chainid].push(_collateralTokens[i]);
    }

    _grantRole(CONTROLLER_ROLE, msg.sender);
    collateralManagerOwner=msg.sender;

}

modifier onlyActiveCollateral(address token) {
    if (!collateralTypes[token].isActive || collateralTypes[token].priceFeed == address(0)) {
        revert TokenPriceNotAvailable();
    }
    _;
}



modifier onlyExistingCollateral(address token){
if(collateralTypes[token].priceFeed == address(0) || collateralTypes[token].minCollateralRatio == 0) {
    revert InvalidCollateralToken();
}
_;
}

modifier onlyOwner(){
    if(msg.sender != collateralManagerOwner){
        revert IneligibleSender(msg.sender);
    }  
    _;
}

modifier onlyController(){
    if(!hasRole(CONTROLLER_ROLE, msg.sender)){
        revert IneligibleSender(msg.sender);
    }
_;
}

modifier onlyNotExistingCollateral(address proposedCollateralToken){
    if(collateralTypes[proposedCollateralToken].priceFeed != address(0) && collateralTypes[proposedCollateralToken].minCollateralRatio != 0){
        revert CollateralAlreadyExists();
    }
    _;
}

function grantControllerRole (address pendingControllerAddress) onlyOwner external {
  _grantRole(CONTROLLER_ROLE, pendingControllerAddress);  

  emit RoleGranted(CONTROLLER_ROLE, pendingControllerAddress, msg.sender);
}


function addCollateralType(
    address collateralToken,
    address priceFeed,
    uint256 minCollateralRatio,
    uint256 liquidationBonus,
    uint256 punishment
) external onlyNotExistingCollateral(collateralToken) onlyController {

if(minCollateralRatio < minimalCollatarealRatio){
    revert TooLowMinCollateralRatio(minCollateralRatio);
}


    collateralTypes[collateralToken] = CollateralInfo({
        priceFeed: priceFeed,
        minCollateralRatio: minCollateralRatio,
        isActive: true,
        liquidationBonus: liquidationBonus,
        punishment: punishment
    });
    collateralTokens[block.chainid].push(collateralToken);
    }

function updateCollateral(
    address collateralToken,
    address priceFeed,
    uint256 minCollateralRatio
) external onlyController onlyExistingCollateral(collateralToken) {
if(minCollateralRatio < minimalCollatarealRatio || priceFeed == address(0)){
    revert InvalidUpdateData();
}

    collateralTypes[collateralToken].minCollateralRatio = minCollateralRatio;
    collateralTypes[collateralToken].priceFeed = priceFeed;
}

function toggleCollateral(address token) external onlyController onlyExistingCollateral(token) {
   collateralTypes[token].isActive = !collateralTypes[token].isActive;
}

function getTokenPriceFromPriceFeed(address priceFeedAddress) public view  returns (uint256){
    AggregatorV3Interface priceFeedInterface = AggregatorV3Interface(priceFeedAddress);
       (
        /* uint80 roundId */,
        int256 answer,
        /*uint256 startedAt*/,
        uint256 updatedAt,
        /*uint80 answeredInRound*/
    ) = priceFeedInterface.latestRoundData();

    if(answer <= 0 || updatedAt == 0){
        revert TokenPriceNotAvailable();
    }

    uint8 decimals = priceFeedInterface.decimals();
    return (uint256(answer) * 1e18) / (10 ** decimals);
}

function getTokenPrice(address token) public view onlyActiveCollateral(token) returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(collateralTypes[token].priceFeed);
           (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            uint256 updatedAt,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();

    

uint8 decimals = priceFeed.decimals();
        return (uint256(answer) * 1e18) / (10 ** decimals);
    }

function getCollateralInfo(address token) public view onlyExistingCollateral(token) returns (
    address, uint256, bool, uint256, uint256) {
    return (collateralTypes[token].priceFeed, collateralTypes[token].minCollateralRatio, collateralTypes[token].isActive, collateralTypes[token].liquidationBonus, collateralTypes[token].punishment);
}

function getCollateralTokens() public view returns (address[] memory) {
    return collateralTokens[block.chainid];
}

function getTheCollateralManagerOwner() public view returns (address){
    return collateralManagerOwner;
<<<<<<< HEAD
=======
}

>>>>>>> main/main
}

}