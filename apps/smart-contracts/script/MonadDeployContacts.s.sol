// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "../lib/forge-std/src/Script.sol";

import {VaultManager} from "../src/VaultManager.sol";
import {StabilskiToken} from "../src/StabilskiToken.sol";
import {USDPLNOracle} from "../src/USDPLNOracle.sol";
import {CollateralManager} from "../src/CollateralManager.sol";
import {StabilskiTokenPool} from "../src/pools/StabilskiTokenPool.sol";
import {IERC20} from "@chainlink/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
contract DeployContracts is Script {
address[] whitelist;
function run() public returns (VaultManager, StabilskiToken, USDPLNOracle, CollateralManager, StabilskiTokenPool) {
    // Deploy contracts
    vm.startBroadcast();
    StabilskiToken stabilskiToken = new StabilskiToken();
    USDPLNOracle usdPlnOracle = new USDPLNOracle(vm.envAddress("ETH_ROUTER"), vm.envBytes32("ETH_DON_ID"));
    CollateralManager collateralManager = new CollateralManager();
    VaultManager vaultManager = new VaultManager(address(usdPlnOracle), address(stabilskiToken), address(collateralManager));
    stabilskiToken.grantControllerRole(address(vaultManager));
    stabilskiToken.transferOwnership(address(vaultManager));
    StabilskiTokenPool stabilskiTokenPool = new StabilskiTokenPool(
        IERC20(address(stabilskiToken)),
        18,
        whitelist,
        vm.envAddress("MONAD_CCIP_ROUTER"),
        vm.envAddress("MONAD_CCIP_CHAIN_RMN")
    );
 vm.stopBroadcast();
 return (vaultManager, stabilskiToken, usdPlnOracle, collateralManager, stabilskiTokenPool);

}

}