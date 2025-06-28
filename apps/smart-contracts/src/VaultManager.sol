// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {StabilskiToken} from "./StabilskiToken.sol";
import {CollateralManager} from "./CollateralManager.sol";
import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {AggregatorV3Interface} from "../../lib/chainlink-brownie-contracts/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
contract VaultManager is Ownable, ReentrancyGuard {
error NotWhitelistedCollateral();
error TokenPriceNotAvailable();

    StabilskiToken public stabilskiToken;
    CollateralManager public collateralManager;

    struct Vault {
    mapping(address => uint256) collateral; // token => amount
    uint256 debt;
}
mapping(address => Vault) public vaults; // user => Vault

modifier onlyWhitelistedCollateral(address collateralToken) {
(address priceFeed,,) = collateralManager.collateralTypes(collateralToken);

    if (priceFeed == address(0)) {
        revert NotWhitelistedCollateral();
    }
    _;
}
    constructor(address _token, address _collateralManager) Ownable(msg.sender) {
        stabilskiToken = StabilskiToken(_token);
        collateralManager = CollateralManager(_collateralManager);
    }
    


function depositCollateral(address token, uint256 amount) external onlyWhitelistedCollateral(token){
    vaults[msg.sender].collateral[token] += amount;

}


function withdrawCollateral(address token, uint256 amount) external{

}


function mintStablecoin(uint256 amount) external{

}


function repayStablecoin(uint256 amount) external{}


function getVaultValueInUSD(address user) public view returns (uint256){}


function getVaultValueInPLN(address user) public view returns (uint256){}


function getCollateralRatio(address user) public view returns (uint256){}


function getTokenPriceUSD(address token) internal view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(token);
           (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            uint256 updatedAt,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();

    if (updatedAt == 0 || answer <= 0) {
        revert TokenPriceNotAvailable();
    }
    return uint256(answer);
}


function getUSDToPLNRate() internal view returns (uint256){

}



}