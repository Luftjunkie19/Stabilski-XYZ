// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.24;

// import {InformationCCIPRetriever} from '../../../src/ccip/CcipInfromationRetriever.sol';

// import {Script} from '../../../lib/forge-std/src/Script.sol';

// contract DeployTestCcipRetriever is Script {

// function run(address stabilskiSourceAddress, address routerAddress, address feeReceiver, address usdPlnOracleAddress, address collateralManagerAddress, address ethUsdPriceFeed) external returns (InformationCCIPRetriever){

// InformationCCIPRetriever ccipRetriever;

// vm.startBroadcast();

// ccipRetriever = new InformationCCIPRetriever(
// stabilskiSourceAddress,
// routerAddress,
// feeReceiver,
// usdPlnOracleAddress,
// collateralManagerAddress,
// ethUsdPriceFeed);

// vm.stopBroadcast();

// return ccipRetriever;

// }

// }