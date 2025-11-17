// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.24;

// import {InformationCCIPRetriever} from '../../src/ccip/CcipInfromationRetriever.sol';

// import {Script} from '../../lib/forge-std/src/Script.sol';

// contract DeployCcipRetriever is Script {

// function run() external returns (InformationCCIPRetriever){

// InformationCCIPRetriever ccipRetriever;

// vm.startBroadcast();

// if(block.chainid == vm.envUint("ETH_SEPOLIA_CHAINID")){
// ccipRetriever = new InformationCCIPRetriever(
//     vm.envAddress('STABILSKI_ETH_TOKEN_ADDR'),
//     vm.envAddress("ETH_CCIP_ROUTER")
//      );
// }

// if(block.chainid == vm.envUint("ARBITRUM_TESTNET_CHAINID")){
// ccipRetriever = new InformationCCIPRetriever(
//     vm.envAddress('STABILSKI_ARB_TOKEN_ADDR'), 
//     vm.envAddress("ARBITRUM_CCIP_ROUTER")
//     );
// }

// if(block.chainid == vm.envUint("BASE_TESTNET_CHAINID")){
// ccipRetriever = new InformationCCIPRetriever(
//     vm.envAddress("STABILSKI_BASE_TOKEN_ADDR"), 
//     vm.envAddress("BASE_CCIP_ROUTER")
//     );
// }

// vm.stopBroadcast();

// return ccipRetriever;

// }

// }