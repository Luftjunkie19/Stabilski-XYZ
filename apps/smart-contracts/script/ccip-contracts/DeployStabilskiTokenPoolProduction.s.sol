// SPDX-License-Identifier: SEE LICENSE IN LICENSE
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


function run (address tokenAddress, address tokenAdmin, address firstRemoteTokenAddress, address secondRemoteTokenAddress, address rmnProxy,
address router, uint64 firstRemoteChainSelector,
uint64 secondRemoteChainSelector,
address tokenAdminRegistryAddress,
address registryModuleOwnerCustom
) external returns (BurnMintTokenPool stabilskiTokenPool) {

    vm.startBroadcast();

    (stabilskiTokenPool) = deployStabilskiTokenOnChain(tokenAddress, tokenAdmin, firstRemoteTokenAddress, secondRemoteTokenAddress, rmnProxy, router, firstRemoteChainSelector, secondRemoteChainSelector,
    tokenAdminRegistryAddress,registryModuleOwnerCustom
    );

    vm.stopBroadcast();

    return (stabilskiTokenPool);

}

function deployStabilskiTokenOnChain(
address tokenAddress, 
address tokenAdmin, 
address firstRemoteTokenAddress, 
address secondRemoteTokenAddress,
address rmnProxy,
address router,
uint64 firstRemoteChainSelector,
uint64 secondRemoteChainSelector,
address tokenAdminRegistryAddress,
address registryModuleOwnerCustom
) internal returns(BurnMintTokenPool stabilskiPool){
    

       (stabilskiPool) = performDeploy(tokenAddress, 
        tokenAdmin, 
        router, 
        tokenAdminRegistryAddress, registryModuleOwnerCustom, 
        firstRemoteChainSelector, firstRemoteTokenAddress, 
        secondRemoteChainSelector, secondRemoteTokenAddress, rmnProxy);
        return (stabilskiPool);
    


 

}

function performDeploy(
address tokenAddress,
address tokenAdmin,
address routerAddress,
address tokenAdminRegistryAddress,
address registryModuleOwnerCustom,
uint64 firstRemoteChainSelector,
address firstRemoteTokenAddress,
uint64 secondRemoteChainSelector,
address secondRemoteTokenAddress,
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

        // ChainUpdates + chain configurations etc.
        TokenPool.ChainUpdate[] memory chains = new TokenPool.ChainUpdate[](2);
      
        
        chains[0] = TokenPool.ChainUpdate({
            remoteChainSelector: firstRemoteChainSelector,
            remotePoolAddress: abi.encode(address(tokenPool)),
            allowed:true,
            remoteTokenAddress: abi.encode(firstRemoteTokenAddress),
            outboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 1e24, rate: 167}),
            inboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 1e24, rate: 167})
        });

        //   chains[1] = TokenPool.ChainUpdate({
        //     remoteChainSelector: secondRemoteChainSelector,
        //     remotePoolAddress: abi.encode(address(tokenPool)),
        //     allowed:true,
        //     remoteTokenAddress: abi.encode(secondRemoteTokenAddress),
        //     outboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 1e24, rate: 167}),
        //     inboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 1e24, rate: 167})
        // });


TokenPool(address(tokenPool)).applyChainUpdates(chains);

stabilskiTokenPool = tokenPool;

return (stabilskiTokenPool);


}



}