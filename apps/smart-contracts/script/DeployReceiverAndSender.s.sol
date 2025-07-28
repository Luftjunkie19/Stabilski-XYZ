// SDPX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {StabilskiTokenReceiver} from "../src/cross-chain-management/StabilskiTokenReceiver.sol";
import {StabilskiTokenSender} from "../src/cross-chain-management/StabilskiTokenSender.sol";
import {Script} from "../lib/forge-std/src/Script.sol";
contract DeployReceiverAndSender is Script  {
function run() public returns (StabilskiTokenReceiver stabilskiTokenReceiver, StabilskiTokenSender stabilskiTokenSender) {
    vm.startBroadcast();
if(block.chainid == vm.envUint("ETH_SEPOLIA_CHAINID")) {
     stabilskiTokenSender = new StabilskiTokenSender(vm.envAddress("ETH_CCIP_ROUTER"), 0x85ea2749672d2d3d34561E0e14a834A2c2238F0D);
     stabilskiTokenReceiver = new StabilskiTokenReceiver(vm.envAddress("ETH_CCIP_ROUTER"), 0xf229A0d0294917Dfa413bA680106b32824Ab8Bc2, 0x85ea2749672d2d3d34561E0e14a834A2c2238F0D, 0x33E871013d7589d7f818822E90bc88308c5aEb4F);
}

if(block.chainid == vm.envUint("ARBITRUM_TESTNET_CHAINID")){
      stabilskiTokenSender = new StabilskiTokenSender(vm.envAddress("ARBITRUM_CCIP_ROUTER"), 0xf229A0d0294917Dfa413bA680106b32824Ab8Bc2);
     stabilskiTokenReceiver = new StabilskiTokenReceiver(vm.envAddress("ARBITRUM_CCIP_ROUTER"), 0x85ea2749672d2d3d34561E0e14a834A2c2238F0D, 0xf229A0d0294917Dfa413bA680106b32824Ab8Bc2, 0xf229A0d0294917Dfa413bA680106b32824Ab8Bc2);
}

    vm.stopBroadcast();
    return (stabilskiTokenReceiver, stabilskiTokenSender);

}

}