// SDPX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {StabilskiTokenReceiver} from "../src/cross-chain-management/StabilskiTokenReceiver.sol";
import {StabilskiTokenSender} from "../src/cross-chain-management/StabilskiTokenSender.sol";
import {Script} from "../lib/forge-std/src/Script.sol";
contract DeployReceiverAndSender is Script  {

function run(address ccipRouterAddress, address sourcePool, address destinationPool, address destinationTokenAddress) public returns (StabilskiTokenReceiver stabilskiTokenReceiver, StabilskiTokenSender stabilskiTokenSender) {
    vm.startBroadcast();
     stabilskiTokenSender = new StabilskiTokenSender(ccipRouterAddress, sourcePool);
     stabilskiTokenReceiver = new StabilskiTokenReceiver(ccipRouterAddress, destinationPool, sourcePool, address(destinationTokenAddress));
    vm.stopBroadcast();
    return (stabilskiTokenReceiver, stabilskiTokenSender);

}

}