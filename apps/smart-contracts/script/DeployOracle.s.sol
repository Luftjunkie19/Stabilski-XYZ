// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "../lib/forge-std/src/Script.sol";

import {VaultManager} from "../src/VaultManager.sol";
import {StabilskiToken} from "../src/StabilskiToken.sol";
import {USDPLNOracle} from "../src/USDPLNOracle.sol";
import {CollateralManager} from "../src/CollateralManager.sol";
import {StabilskiTokenPool} from "../src/pools/StabilskiTokenPool.sol";
import {IERC20} from "../lib/chainlink-brownie-contracts/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
contract DeployContracts is Script {
function run() public returns (USDPLNOracle usdPlnOracle) {
    // Deploy contracts

    vm.startBroadcast();

if(block.chainid == vm.envUint("ETH_SEPOLIA_CHAINID")) {
    usdPlnOracle = new USDPLNOracle(vm.envAddress("ETH_ROUTER"), bytes32("fun-ethereum-sepolia-1"), 5286);
}




    vm.stopBroadcast();

return (usdPlnOracle);



}

}