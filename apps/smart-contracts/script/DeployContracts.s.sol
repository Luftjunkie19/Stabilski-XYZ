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
function run() public returns (VaultManager vaultManager, StabilskiToken stabilskiToken, USDPLNOracle usdPlnOracle, CollateralManager collateralManager, StabilskiTokenPool stabilskiTokenPool) {
    // Deploy contracts
address[] memory whitelist;
address[] memory tokens;
address[] memory priceFeeds;
uint256[] memory minCollateralRatios;
if(block.chainid == vm.envUint("ETH_SEPOLIA_CHAINID")) {
    tokens = new address[](3);
    priceFeeds = new address[](3) ;
    minCollateralRatios = new uint256[](3) ;
    tokens[0]=vm.envAddress("SEPOLIA_ETH_WBTC_ADDR");
tokens[1]=vm.envAddress("SEPOLIA_ETH_WETH_ADDR");
tokens[2]=vm.envAddress("SEPOLIA_ETH_LINK_ADDR");
priceFeeds[0]=vm.envAddress("ETH_BTC_USD");
priceFeeds[1]=vm.envAddress("ETH_ETH_USD");
priceFeeds[2]=vm.envAddress("ETH_LINK_USD");
minCollateralRatios[0]=135e16;
minCollateralRatios[1]=125e16;
minCollateralRatios[2]=12e17;
}
    vm.startBroadcast();

if(block.chainid == vm.envUint("ETH_SEPOLIA_CHAINID")) {


    stabilskiToken = new StabilskiToken();
    usdPlnOracle =  USDPLNOracle(0xaef39208fACc3eDC7Bc16949B32A5A4AcBF4aeC1);
    collateralManager = new CollateralManager(tokens, priceFeeds, minCollateralRatios);
    vaultManager = new VaultManager(address(usdPlnOracle), address(stabilskiToken), address(collateralManager));
    stabilskiTokenPool = new StabilskiTokenPool(
        IERC20(address(stabilskiToken)),
        18,
        whitelist,
        vm.envAddress("ETH_CCIP_ROUTER"),
        vm.envAddress("ETH_CCIP_RMN")
    );

stabilskiToken.grantControllerRole(address(vaultManager));
stabilskiToken.transferOwnership(address(vaultManager));

}




    vm.stopBroadcast();

return (vaultManager, stabilskiToken, usdPlnOracle, collateralManager, stabilskiTokenPool);




}

}