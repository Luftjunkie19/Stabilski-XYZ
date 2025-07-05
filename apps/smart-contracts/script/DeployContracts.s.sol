// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "../lib/forge-std/src/Script.sol";

import {VaultManager} from "../src/VaultManager.sol";
import {StabilskiToken} from "../src/StabilskiToken.sol";
import {USDPLNOracle} from "../src/USDPLNOracle.sol";
import {CollateralManager} from "../src/CollateralManager.sol";
import {StabilskiTokenPool} from "../src/pools/StabilskiTokenPool.sol";

contract DeployContracts is Script {

function run() public returns (VaultManager, StabilskiToken, USDPLNOracle, CollateralManager, StabilskiTokenPool) {
    // Deploy contracts
    StabilskiToken stabilskiToken = new StabilskiToken();
    USDPLNOracle usdPlnOracle = new USDPLNOracle();
    CollateralManager collateralManager = new CollateralManager();
    VaultManager vaultManager = new VaultManager(address(usdPlnOracle), address(stabilskiToken), address(collateralManager));
    stabilskiToken.grantControllerRole(address(vaultManager));
    stabilskiToken.transferOwnership(address(vaultManager));
    StabilskiTokenPool stabilskiTokenPool = new StabilskiTokenPool(
        IERC20(address(stabilskiToken)), 
        18, 
    [0xd],
    /* proxy rpc address */ 
    address(vaultManager),
 /* router rpc address */ address(vaultManager));

}

}