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

contract DeployProductionContracts is Script {
function run() public returns (VaultManager vaultManager, StabilskiToken stabilskiToken, USDPLNOracle usdPlnOracle, CollateralManager collateralManager, StabilskiTokenPool stabilskiTokenPool) {
address[] memory tokens;
address[] memory whitelist;
address[] memory priceFeeds;
uint256[] memory minCollateralRatios;
    // Deploy contracts
    vm.startBroadcast();

if(block.chainid == vm.envUint("ETH_SEPOLIA_CHAINID")) {
    tokens = new address[](3);
priceFeeds = new address[](3) ;
minCollateralRatios = new uint256[](3) ;
tokens[0]=address(vm.envAddress("SEPOLIA_ETH_WBTC_ADDR"));
tokens[1]=address(vm.envAddress("SEPOLIA_ETH_WETH_ADDR"));
tokens[2]=address(vm.envAddress("SEPOLIA_ETH_LINK_ADDR"));
priceFeeds[0]=vm.envAddress("ETH_BTC_USD");
priceFeeds[1]=vm.envAddress("ETH_ETH_USD");
priceFeeds[2]=vm.envAddress("ETH_LINK_USD");
minCollateralRatios[0]=15e17;
minCollateralRatios[1]=135e16;
minCollateralRatios[2]=145e16;

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

stabilskiToken.grantControllerRole(address(stabilskiTokenPool));
stabilskiToken.grantControllerRole(address(vaultManager));
stabilskiToken.transferOwnership(address(vaultManager));
}

  if(block.chainid == vm.envUint("ARBITRUM_TESTNET_CHAINID")) {
    tokens = new address[](1);
priceFeeds = new address[](1) ;
minCollateralRatios = new uint256[](1);
tokens[0]=address(vm.envAddress("ARBITRUM_LINK_ADDRESS"));
priceFeeds[0]=vm.envAddress("ARBITRUM_LINK_USD_RATE");
minCollateralRatios[0]=12e17;

    
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
stabilskiToken.grantControllerRole(address(stabilskiTokenPool));
stabilskiToken.grantControllerRole(address(vaultManager));
stabilskiToken.transferOwnership(address(vaultManager));
}
    vm.stopBroadcast();

return (vaultManager, stabilskiToken, usdPlnOracle, collateralManager, stabilskiTokenPool);
}

}