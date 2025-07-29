// SDPX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {StabilskiTokenReceiver} from "../src/cross-chain-management/StabilskiTokenReceiver.sol";
import {StabilskiTokenSender} from "../src/cross-chain-management/StabilskiTokenSender.sol";
import {Script} from "../lib/forge-std/src/Script.sol";
contract DeployReceiverAndSender is Script  {
function run(address router, address sourcePool, address destPool, address destToken) public returns (StabilskiTokenReceiver stabilskiTokenReceiver, StabilskiTokenSender stabilskiTokenSender) {
    vm.startBroadcast();
if(block.chainid == vm.envUint("ETH_SEPOLIA_CHAINID")) {
     stabilskiTokenSender = new StabilskiTokenSender(router, sourcePool);
     stabilskiTokenReceiver = new StabilskiTokenReceiver(router, destPool, sourcePool, destToken);
}

if(block.chainid == vm.envUint("ARBITRUM_TESTNET_CHAINID")){
      stabilskiTokenSender = new StabilskiTokenSender(router, sourcePool);
     stabilskiTokenReceiver = new StabilskiTokenReceiver(router, destPool, sourcePool, destToken);
}

    vm.stopBroadcast();
    return (stabilskiTokenReceiver, stabilskiTokenSender);

}

}