// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {InformationCCIPRetriever} from '../../src/ccip/CcipInfromationRetriever.sol';

import {Script} from '../../lib/forge-std/src/Script.sol';

contract DeployCcipRetriever is Script {

function run() external returns (InformationCCIPRetriever){

InformationCCIPRetriever ccipRetriever;

vm.startBroadcast();

if(block.chainid == vm.envUint("ETH_SEPOLIA_CHAINID")){
ccipRetriever = new InformationCCIPRetriever(
    vm.envAddress('STABILSKI_ETH_TOKEN_ADDR'),
    vm.envAddress("ETH_CCIP_ROUTER"),
    vm.envAddress("FEE_RECEIVER_ADDRESS"),
    address(0xc029DD0988f48E02a47b0BdA5Ccb1d77031eF430),
    address(0xEeFF96071Dd0fB31F7eDeC53231c5fAC484d6e8B),
    vm.envAddress("ETH_ETH_USD")
     );
}

if(block.chainid == vm.envUint("ARBITRUM_TESTNET_CHAINID")){
ccipRetriever = new InformationCCIPRetriever(
    vm.envAddress('STABILSKI_ARB_TOKEN_ADDR'), 
    vm.envAddress("ARBITRUM_CCIP_ROUTER"),
    vm.envAddress("FEE_RECEIVER_ADDRESS"),
    address(0x8D9E99b9546848d465B53E257cBb4baBcA7fAadf),
    address(0x1Eeb6f7fC5b108cc6c68A8704778561F369B9816),
    vm.envAddress("ARB_ETH_USD_RATE")
    );
}

if(block.chainid == vm.envUint("BASE_TESTNET_CHAINID")){
ccipRetriever = new InformationCCIPRetriever(
    vm.envAddress("STABILSKI_BASE_TOKEN_ADDR"), 
    vm.envAddress("BASE_CCIP_ROUTER"),
     vm.envAddress("FEE_RECEIVER_ADDRESS"),
    address(0x8D9E99b9546848d465B53E257cBb4baBcA7fAadf),
    address(0x1Eeb6f7fC5b108cc6c68A8704778561F369B9816),
    vm.envAddress("BASE_ETH_USD_RATE")

    );
}

vm.stopBroadcast();

return ccipRetriever;

}

}