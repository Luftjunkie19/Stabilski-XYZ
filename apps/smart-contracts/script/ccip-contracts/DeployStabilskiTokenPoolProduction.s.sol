// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;

import {Script} from '../../lib/forge-std/src/Script.sol';
import {IBurnMintERC20} from "../../lib/ccip/contracts/src/v0.8/shared/token/ERC20/IBurnMintERC20.sol";
import {BurnMintTokenPool} from "../../lib/ccip/contracts/src/v0.8/ccip/pools/BurnMintTokenPool.sol";
import {RegistryModuleOwnerCustom} from "../../lib/ccip/contracts/src/v0.8/ccip/tokenAdminRegistry/RegistryModuleOwnerCustom.sol";
import {TokenAdminRegistry} from "../../lib/ccip/contracts/src/v0.8/ccip/tokenAdminRegistry/TokenAdminRegistry.sol";
import {StabilskiToken} from "../../src/StabilskiToken.sol";
import {TokenPool} from "../../lib/ccip/contracts/src/v0.8/ccip/pools/TokenPool.sol";



contract DeployStabilskiTokenPool is Script {
error CCIPAdminAddressInvalid();

error OnlyPendingAdministratorAllowed(address msgSender, address pendingAdmin);


function run (address stabilskiTokenSepoliaEth, address stabilskiTokenArbSepolia, address stabilskiTokenBaseSepolia, address tokenAdmin) external returns (BurnMintTokenPool stabilskiTokenPoolFirstChain) {

    vm.startBroadcast();

    (stabilskiTokenPoolFirstChain) = deployStabilskiTokenOnChain(stabilskiTokenSepoliaEth,stabilskiTokenArbSepolia,stabilskiTokenBaseSepolia, tokenAdmin);

    vm.stopBroadcast();

    return (stabilskiTokenPoolFirstChain);

}

function deployStabilskiTokenOnChain(address stabilskiTokenSepoliaEth, address stabilskiTokenArbSepolia, address stabilskiTokenBaseSepolia, address tokenAdmin) internal returns(BurnMintTokenPool stabilskiTokenPoolFirstChain){
    if(block.chainid == vm.envUint("ARBITRUM_TESTNET_CHAINID")){
        address tokenAdminRegistryAddress = vm.envAddress("ARBITRUM_TOKEN_ADMIN_REGISTRY");
        address registryModuleOwnerCustom = vm.envAddress("ARBITRUM_TOKEN_REGISTRY_MODULE_OWNER");
        address arbitrumSepoliaRmnProxy= vm.envAddress("ARBITRUM_CCIP_CHAIN_RMN");
        address arbitrumSepoliaRouter=vm.envAddress("ARBITRUM_CCIP_ROUTER");

       (stabilskiTokenPoolFirstChain) = performDeploy(stabilskiTokenArbSepolia, 
        arbitrumSepoliaRouter, 
        tokenAdminRegistryAddress, registryModuleOwnerCustom, arbitrumSepoliaRmnProxy, tokenAdmin);

        return (stabilskiTokenPoolFirstChain);
    }


    if(block.chainid == vm.envUint("ETH_SEPOLIA_CHAINID")){
        address tokenAdminRegistryAddress = vm.envAddress("ETH_CCIP_TOKEN_ADMIN_REGISTRY");
        address registryModuleOwnerCustom = vm.envAddress("ETH_CCIP_MODULE_REGISTRY_OWNER");
        address ethereumRMNProxy = vm.envAddress("ETH_CCIP_RMN");
        address ethSepoliaRouter = vm.envAddress("ETH_ROUTER");


(stabilskiTokenPoolFirstChain) = performDeploy(stabilskiTokenSepoliaEth,
ethSepoliaRouter, tokenAdminRegistryAddress, 
registryModuleOwnerCustom, ethereumRMNProxy, tokenAdmin);


return (stabilskiTokenPoolFirstChain);
    }


    if(block.chainid == vm.envUint("BASE_TESTNET_CHAINID")){
        address tokenAdminRegistryAddress = vm.envAddress("BASE_TOKEN_ADMIN_REGISTRY");
        address registryModuleOwnerCustom = vm.envAddress("BASE_REGISTRY_MODULE_OWNER");
        address baseSepoliaRMNProxy = vm.envAddress("BASE_CCIP_RMN_CONTRACTOR");
        address baseSepoliaRouter=vm.envAddress("ETH_ROUTER");

    (stabilskiTokenPoolFirstChain) = performDeploy(stabilskiTokenBaseSepolia,
     baseSepoliaRouter, tokenAdminRegistryAddress, 
     registryModuleOwnerCustom, baseSepoliaRMNProxy, tokenAdmin);



    return (stabilskiTokenPoolFirstChain);
    }

}

function performDeploy(
address tokenAddress,
address routerAddress,
address tokenAdminRegistryAddress,
address registryModuleOwnerCustom,
address rmnProxy,
address tokenAdmin
) private returns (BurnMintTokenPool stabilskiTokenPool) {

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
