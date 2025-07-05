// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "../lib/forge-std/src/Script.sol";

import {VaultManager} from "../src/VaultManager.sol";
import {StabilskiToken} from "../src/StabilskiToken.sol";
import {USDPLNOracle} from "../src/USDPLNOracle.sol";
import {CollateralManager} from "../src/CollateralManager.sol";
import {BurnMintTokenPool} from "../src/pools/BurnMintTokenPool.sol";

contract DeployContracts is Script {

function run() public returns (VaultManager, StabilskiToken, USDPLNOracle, CollateralManager, BurnMintTokenPool) {
    // Deploy contracts
    CollateralManager collateralManager = new CollateralManager();
    USDPLNOracle usdPlnOracle = new USDPLNOracle();
    StabilskiToken stabilskiToken = new StabilskiToken();
    VaultManager vaultManager = new VaultManager();
    BurnMintTokenPool burnMintTokenPool = new BurnMintTokenPool();

}

}