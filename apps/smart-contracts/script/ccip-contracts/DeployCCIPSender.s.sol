// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "../../lib/forge-std/src/Script.sol";

import {CcipSender} from "../../src/CCIPSender.sol";

contract DeployCcipSender is Script{
    function run (address routerAddress, address tokenAddress) external returns(CcipSender){

CcipSender ccipSender;
vm.startBroadcast();
ccipSender= new CcipSender(routerAddress, tokenAddress);
vm.stopBroadcast();

return ccipSender;

    }
}