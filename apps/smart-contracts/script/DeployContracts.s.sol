// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "../lib/forge-std/src/Script.sol";

import {VaultManager} from "../src/VaultManager.sol";
import {StabilskiToken} from "../src/StabilskiToken.sol";
import {USDPLNOracle} from "../src/USDPLNOracle.sol";
import {CollateralManager} from "../src/CollateralManager.sol";

contract DeployContracts is Script {
function run(address[] memory tokens, address[] memory whitelist, address[] memory priceFeeds, uint256[] memory minCollateralRatios) public returns (VaultManager vaultManager, StabilskiToken stabilskiToken, USDPLNOracle usdPlnOracle, CollateralManager collateralManager) {
    // Deploy contracts
    vm.startBroadcast();

if(block.chainid == vm.envUint("ETH_SEPOLIA_CHAINID")) {
    stabilskiToken = new StabilskiToken("Stabilski", "PLST");
    usdPlnOracle =  USDPLNOracle(0xC13Bf069727B9293e8507E9f82d28BD31AAbB886);
    collateralManager = new CollateralManager(tokens, priceFeeds, minCollateralRatios);
    vaultManager = new VaultManager(address(usdPlnOracle), address(stabilskiToken), address(collateralManager), tokens[0]);
    
stabilskiToken.grantControllerRole(address(vaultManager));
stabilskiToken.grantControllerRole(msg.sender);


}


if(block.chainid == vm.envUint("ARBITRUM_TESTNET_CHAINID")) {
    stabilskiToken = new StabilskiToken("Stabilski", "PLST");
    usdPlnOracle =  USDPLNOracle(0x77822eCC7FA85732d9BbfE52DaAcAe3CDBA006b7);
    collateralManager = new CollateralManager(tokens, priceFeeds, minCollateralRatios);
    vaultManager = new VaultManager(address(usdPlnOracle), address(stabilskiToken), address(collateralManager), address(0));

stabilskiToken.grantControllerRole(address(vaultManager));
stabilskiToken.grantControllerRole(msg.sender);



}


if(block.chainid == vm.envUint("BASE_TESTNET_CHAINID")) {
    stabilskiToken = new StabilskiToken("Stabilski", "PLST");
    usdPlnOracle =  USDPLNOracle(0xD2660205926F59E7fec8a169EbC89ab03413c25E);
    collateralManager = new CollateralManager(tokens, priceFeeds, minCollateralRatios);
    vaultManager = new VaultManager(address(usdPlnOracle), address(stabilskiToken), address(collateralManager), address(0));

stabilskiToken.grantControllerRole(address(vaultManager));
stabilskiToken.grantControllerRole(msg.sender);


}


vm.stopBroadcast();

return (vaultManager, stabilskiToken, usdPlnOracle, collateralManager);
}

}