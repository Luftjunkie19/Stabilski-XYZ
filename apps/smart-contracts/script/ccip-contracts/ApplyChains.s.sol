// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "../../lib/forge-std/src/Script.sol";

import {TokenPool} from "../../lib/ccip/contracts/src/v0.8/ccip/pools/TokenPool.sol";
import {RateLimiter} from "../../lib/ccip/contracts/src/v0.8/ccip/libraries/RateLimiter.sol";

contract ApplyChains is Script {

function run(
    address tokenPoolAddress, address firstRemoteTokenPoolAddress, 
    address secondRemoteTokenPoolAddress, 
    uint64 firstRemoteChainSelector, uint64 secondRemoteChainSelector, 
address firstRemoteTokenAddress, address secondRemoteTokenAddress) external {

  applyChains(tokenPoolAddress, firstRemoteTokenPoolAddress, firstRemoteChainSelector, firstRemoteTokenAddress);
 applyChains(tokenPoolAddress, secondRemoteTokenPoolAddress, secondRemoteChainSelector, secondRemoteTokenAddress);


}


function applyChains(address tokenPoolAddress, address remoteTokenPoolAddress, uint64 remoteChainSelector, address remoteTokenAddress) internal{

TokenPool tokenPool = TokenPool(tokenPoolAddress);


    // ChainUpdates + chain configurations etc.
        TokenPool.ChainUpdate[] memory chains = new TokenPool.ChainUpdate[](1);
      
        
        chains[0] = TokenPool.ChainUpdate({
            remoteChainSelector: remoteChainSelector,
            remotePoolAddress: abi.encode(address(remoteTokenPoolAddress)),
            allowed:true,
            remoteTokenAddress: abi.encode(remoteTokenAddress),
            outboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 1e24, rate: 167}),
            inboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 1e24, rate: 167})
        });

        

tokenPool.applyChainUpdates(chains);
}


}