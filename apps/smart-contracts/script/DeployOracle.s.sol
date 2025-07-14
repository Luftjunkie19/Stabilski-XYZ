// SDPX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {USDPLNOracle} from "../src/USDPLNOracle.sol";
import {Script} from "../lib/forge-std/src/Script.sol";
contract DeployReceiverAndSender is Script  {

function run() public returns (USDPLNOracle usdplnOracle) {
    vm.startBroadcast();

    USDPLNOracle usdplnOracleArbitrum = new USDPLNOracle(vm.envAddress("ARBITRUM_FUNCTIONS_ROUTER"), vm.envBytes32("ARBITRUM_DON_ID"), 398);
    vm.stopBroadcast();
    return (usdplnOracleArbitrum);

}

}