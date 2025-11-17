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
    address tokenAddr, 
    address poolAdmin,
    address rmnProxy,
    address router, 
    address tokenAdminRegistry,
    address regsitryModuleOwner

) external returns (BurnMintTokenPool stabilskiTokenPool) {

    vm.startBroadcast();

    (stabilskiTokenPool)= performDeploy(tokenAddr, poolAdmin, router, tokenAdminRegistry, regsitryModuleOwner, rmnProxy);



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