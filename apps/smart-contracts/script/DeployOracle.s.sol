// // SDPX-License-Identifier: MIT
// pragma solidity ^0.8.24;

// import {USDPLNOracle} from "../src/USDPLNOracle.sol";
// import {Script} from "../lib/forge-std/src/Script.sol";
// contract DeployReceiverAndSender is Script  {

// function run() public returns (USDPLNOracle usdplnOracle) {
//     vm.startBroadcast();
// if(block.chainid == vm.envUint("ARBITRUM_TESTNET_CHAINID")) {
    
//     usdplnOracle = new USDPLNOracle(vm.envAddress("ARBITRUM_FUNCTIONS_ROUTER"), vm.envBytes32("ARBITRUM_DON_ID"), 407);
// }

// if(block.chainid == vm.envUint("ETH_SEPOLIA_CHAINID")) {
//     usdplnOracle = new USDPLNOracle(vm.envAddress("ETH_ROUTER"), vm.envBytes32("ETH_DON_ID"), 5352);
// }

//     vm.stopBroadcast();
//     return (usdplnOracle);

// }

// }