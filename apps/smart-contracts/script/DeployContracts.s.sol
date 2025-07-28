// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "../lib/forge-std/src/Script.sol";

import {VaultManager} from "../src/VaultManager.sol";
import {StabilskiToken} from "../src/StabilskiToken.sol";
import {USDPLNOracle} from "../src/USDPLNOracle.sol";
import {CollateralManager} from "../src/CollateralManager.sol";
import {StabilskiTokenPool} from "../src/pools/StabilskiTokenPool.sol";
import {StabilskiTokenReceiver} from "../src/cross-chain-management/StabilskiTokenReceiver.sol";
import {StabilskiTokenSender} from "../src/cross-chain-management/StabilskiTokenSender.sol";

contract DeployContracts is Script {
function run(address[] memory tokens, address[] memory whitelist, address[] memory priceFeeds, uint256[] memory minCollateralRatios) public returns (VaultManager vaultManager, StabilskiToken stabilskiToken, USDPLNOracle usdPlnOracle, CollateralManager collateralManager, StabilskiTokenPool stabilskiTokenPool) {
    // Deploy contracts
    vm.startBroadcast();

if(block.chainid == vm.envUint("ETH_SEPOLIA_CHAINID")) {
    stabilskiToken = new StabilskiToken("Stabilski", "PLST");
    usdPlnOracle =  USDPLNOracle(0x9e2D878784751AC7D8660AaCC3cE536c5cac795d);
    collateralManager = new CollateralManager(tokens, priceFeeds, minCollateralRatios);
    vaultManager = new VaultManager(address(usdPlnOracle), address(stabilskiToken), address(collateralManager));
    stabilskiTokenPool = new StabilskiTokenPool(
        address(stabilskiToken),
        18,
        whitelist,
        vm.envAddress("ETH_CCIP_ROUTER"),
        vm.envAddress("ETH_CCIP_RMN")
    );

stabilskiToken.grantControllerRole(address(vaultManager));
stabilskiToken.grantControllerRole(msg.sender);
stabilskiToken.grantControllerRole(address(stabilskiTokenPool));
stabilskiToken.transferOwnership(address(vaultManager));

}


if(block.chainid == vm.envUint("ARBITRUM_TESTNET_CHAINID")) {
    stabilskiToken = new StabilskiToken("Stabilski", "PLST");
    usdPlnOracle =  USDPLNOracle(0x68D9e90C1e985Bd8277602Bf333FFB8AFBb690D4);
    collateralManager = new CollateralManager(tokens, priceFeeds, minCollateralRatios);
    vaultManager = new VaultManager(address(usdPlnOracle), address(stabilskiToken), address(collateralManager));
    stabilskiTokenPool = new StabilskiTokenPool(
        address(stabilskiToken),
        18,
        whitelist,
        vm.envAddress("ARBITRUM_CCIP_ROUTER"),
        vm.envAddress("ARBITRUM_CCIP_CHAIN_RMN")
    );

stabilskiToken.grantControllerRole(address(vaultManager));
stabilskiToken.grantControllerRole(msg.sender);
stabilskiToken.grantControllerRole(address(stabilskiTokenPool));
stabilskiToken.transferOwnership(address(vaultManager));

}



    vm.stopBroadcast();

return (vaultManager, stabilskiToken, usdPlnOracle, collateralManager, stabilskiTokenPool);
}

}