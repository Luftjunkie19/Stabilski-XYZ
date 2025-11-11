// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from '../../lib/forge-std/src/Script.sol';
import {IBurnMintERC20} from "../../lib/ccip/contracts/src/v0.8/shared/token/ERC20/IBurnMintERC20.sol";
import {BurnMintTokenPool} from "../../lib/ccip/contracts/src/v0.8/ccip/pools/BurnMintTokenPool.sol";
import {RegistryModuleOwnerCustom} from "../../lib/ccip/contracts/src/v0.8/ccip/tokenAdminRegistry/RegistryModuleOwnerCustom.sol";
import {TokenAdminRegistry} from "../../lib/ccip/contracts/src/v0.8/ccip/tokenAdminRegistry/TokenAdminRegistry.sol";
import {StabilskiToken} from "../../src/StabilskiToken.sol";
import {TokenPool} from "../../lib/ccip/contracts/src/v0.8/ccip/pools/TokenPool.sol";
import {RateLimiter} from "../../lib/ccip/contracts/src/v0.8/ccip/libraries/RateLimiter.sol";
contract DeployStabilskiTokenPool is Script {
error CCIPAdminAddressInvalid();

error OnlyPendingAdministratorAllowed(address msgSender, address pendingAdmin);


function run (
) external returns (BurnMintTokenPool stabilskiTokenPool) {

    vm.startBroadcast();

if(block.chainid == vm.envUint("ETH_SEPOLIA_CHAINID")){

    (stabilskiTokenPool) = performDeploy(vm.envAddress("STABILSKI_ETH_TOKEN_ADDR"), msg.sender, 
    vm.envAddress("ETH_CCIP_ROUTER"),
    vm.envAddress("ETH_CCIP_TOKEN_ADMIN_REGISTRY"), 
    vm.envAddress("ETH_CCIP_MODULE_REGISTRY_OWNER"),
    vm.envAddress("ETH_CCIP_RMN")
    );

}

if(block.chainid == vm.envUint("ARBITRUM_TESTNET_CHAINID")){
    (stabilskiTokenPool) = performDeploy(vm.envAddress("STABILSKI_ARB_TOKEN_ADDR"), msg.sender, 
      vm.envAddress("ARBITRUM_CCIP_ROUTER"),
    vm.envAddress("ARBITRUM_TOKEN_ADMIN_REGISTRY"), 
    vm.envAddress("ARBITRUM_TOKEN_REGISTRY_MODULE_OWNER"),
    vm.envAddress("ARBITRUM_CCIP_CHAIN_RMN")
    );

}

if(block.chainid == vm.envUint("BASE_TESTNET_CHAINID")){
        (stabilskiTokenPool) = performDeploy(
vm.envAddress("STABILSKI_BASE_TOKEN_ADDR"), msg.sender, 
vm.envAddress("BASE_CCIP_ROUTER"),
vm.envAddress("BASE_TOKEN_ADMIN_REGISTRY"), 
vm.envAddress("BASE_REGISTRY_MODULE_OWNER"),
vm.envAddress("BASE_CCIP_RMN_CONTRACTOR")
    );
}



    vm.stopBroadcast();

    return (stabilskiTokenPool);

}

function performDeploy(
address tokenAddress,
address tokenAdmin,
address routerAddress,
address tokenAdminRegistryAddress,
address registryModuleOwnerCustom,
address rmnProxy) private returns (BurnMintTokenPool stabilskiTokenPool) {

    StabilskiToken token = StabilskiToken(tokenAddress);

    BurnMintTokenPool tokenPool = new BurnMintTokenPool(
            IBurnMintERC20(address(token)),
            new address[](0), // Empty array for initial operators
            rmnProxy,
            routerAddress
    );

    
    StabilskiToken(tokenAddress).grantControllerRole(address(tokenPool));

    RegistryModuleOwnerCustom registryContract = RegistryModuleOwnerCustom(registryModuleOwnerCustom);

    if(StabilskiToken(tokenAddress).getCCIPAdmin() != tokenAdmin){
    revert CCIPAdminAddressInvalid();
    }

    registryContract.registerAdminViaGetCCIPAdmin(tokenAddress);


        TokenAdminRegistry tokenAdminRegistryContract = TokenAdminRegistry(tokenAdminRegistryAddress);

        TokenAdminRegistry.TokenConfig memory tokenConfig = tokenAdminRegistryContract.getTokenConfig(tokenAddress);

        if(tokenConfig.pendingAdministrator != tokenAdmin){
            revert OnlyPendingAdministratorAllowed(tokenAdmin, tokenConfig.pendingAdministrator);
        }

        tokenAdminRegistryContract.acceptAdminRole(tokenAddress);


        address tokenAdministratorAddress = tokenConfig.administrator;

        // Use the administrator's address to set the pool for the token
        tokenAdminRegistryContract.setPool(tokenAddress, address(tokenPool));

stabilskiTokenPool = tokenPool;

return (stabilskiTokenPool);


}



}