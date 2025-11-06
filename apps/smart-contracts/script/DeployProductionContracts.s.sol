// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "../lib/forge-std/src/Script.sol";

import {VaultManager} from "../src/VaultManager.sol";
import {StabilskiToken} from "../src/StabilskiToken.sol";
import {USDPLNOracle} from "../src/USDPLNOracle.sol";
import {CollateralManager} from "../src/CollateralManager.sol";
contract DeployProductionContracts is Script {
function run() public returns (VaultManager vaultManager, StabilskiToken stabilskiToken, USDPLNOracle usdPlnOracle, CollateralManager collateralManager) {
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
    usdPlnOracle =  USDPLNOracle(0x19F783380a8b3c28d78Ed8367120A130f168258D);
    collateralManager = new CollateralManager(tokens, priceFeeds, minCollateralRatios);
    vaultManager = new VaultManager(address(usdPlnOracle), address(stabilskiToken), address(collateralManager), address(vm.envAddress("SEPOLIA_ETH_WBTC_ADDR")));

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
    usdPlnOracle =  USDPLNOracle(0xC7B39D90DAe640b76d53C794bB043bC10f659Afe);
    collateralManager = new CollateralManager(tokens, priceFeeds, minCollateralRatios);
    vaultManager = new VaultManager(address(usdPlnOracle), address(stabilskiToken), address(collateralManager), address(0));

stabilskiToken.grantControllerRole(address(vaultManager));
stabilskiToken.transferOwnership(address(vaultManager));
}



  if(block.chainid == vm.envUint("BASE_TESTNET_CHAINID")) {
    tokens = new address[](2);
priceFeeds = new address[](2) ;
minCollateralRatios = new uint256[](2);
tokens[0]=address(vm.envAddress("BASE_LINK_CONTRACT"));
tokens[1]=address(vm.envAddress("BASE_WETH_CONTRACT"));

priceFeeds[0]=vm.envAddress("BASE_LINK_USD_RATE");
priceFeeds[1]=vm.envAddress("BASE_ETH_USD_RATE");

minCollateralRatios[0]=135e16;
minCollateralRatios[1]=14e17;

    
    stabilskiToken = new StabilskiToken("Stabilski", "PLST");
    usdPlnOracle =  USDPLNOracle(0xD118005D99908Ee4aE5fbCD387D0Fcedc8d499B0);
    collateralManager = new CollateralManager(tokens, priceFeeds, minCollateralRatios);
    vaultManager = new VaultManager(address(usdPlnOracle), address(stabilskiToken), address(collateralManager), address(0));

stabilskiToken.grantControllerRole(address(vaultManager));
stabilskiToken.transferOwnership(address(vaultManager));
}


    vm.stopBroadcast();

return (vaultManager, stabilskiToken, usdPlnOracle, collateralManager);
}

}