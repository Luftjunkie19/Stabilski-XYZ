// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.24;

// import {Script} from "../../lib/forge-std/src/Script.sol";
// import {BurnMintTokenPool} from "../../lib/ccip/contracts/src/v0.8/ccip/pools/BurnMintTokenPool.sol";
// import { TokenPool} from "../../lib/ccip/contracts/src/v0.8/ccip/pools/BurnMintTokenPool.sol";
// import {RateLimiter} from "../../lib/ccip/contracts/src/v0.8/ccip/libraries/RateLimiter.sol";

// contract ApplyChain is Script {

// function run () external {
//     vm.startBroadcast();

//     if(block.chainid == vm.envUint("ETH_SEPOLIA_CHAINID")){
//         applyChain(
//         vm.envAddress("STABILSKI_ETH_TOKENPOOL_ADDR"), 
//         vm.envAddress("STABILSKI_ARB_TOKENPOOL_ADDR"),
//          vm.envAddress("STABILSKI_BASE_TOKENPOOL_ADDR"),
//           vm.envAddress("STABILSKI_ARB_TOKEN_ADDR"),
//            vm.envAddress("STABILSKI_BASE_TOKEN_ADDR"),
//             uint64(vm.envUint("ARBITRUM_CCIP_CHAIN_SELECTOR")),
//             uint64(vm.envUint("BASE_CCIP_CHAIN_SELECTOR"))
//         );
//     }

//     if(block.chainid == vm.envUint("ARBITRUM_TESTNET_CHAINID")){
// applyChain(
//         vm.envAddress("STABILSKI_ARB_TOKENPOOL_ADDR"),
//         vm.envAddress("STABILSKI_ETH_TOKENPOOL_ADDR"), 
//          vm.envAddress("STABILSKI_BASE_TOKENPOOL_ADDR"),
//           vm.envAddress("STABILSKI_ETH_TOKEN_ADDR"),
//            vm.envAddress("STABILSKI_BASE_TOKEN_ADDR"),
//             uint64(vm.envUint("ETH_CCIP_CHAIN_SELECTOR")),
//             uint64(vm.envUint("BASE_CCIP_CHAIN_SELECTOR"))
//         );
//     }

//     if(block.chainid == vm.envUint("BASE_TESTNET_CHAINID")){
//         applyChain(
//         vm.envAddress("STABILSKI_BASE_TOKENPOOL_ADDR"),
//         vm.envAddress("STABILSKI_ETH_TOKENPOOL_ADDR"), 
//          vm.envAddress("STABILSKI_ARB_TOKENPOOL_ADDR"),
//           vm.envAddress("STABILSKI_ETH_TOKEN_ADDR"),
//            vm.envAddress("STABILSKI_ARB_TOKEN_ADDR"),
//            uint64(vm.envUint("ETH_CCIP_CHAIN_SELECTOR")),
//           uint64(vm.envUint("ARBITRUM_CCIP_CHAIN_SELECTOR"))
//         );
//     }

//     vm.stopBroadcast();
// }

// function applyChain(address sourceTokenPool, address firstRemoteTokenPool, address secondRemoteTokenPool,

// address firstRemoteToken, address secondRemoteToken, uint64 firstRemoteChainSelector, uint64 secondRemoteChainSelector
// ) private {

// BurnMintTokenPool tokenPool = BurnMintTokenPool(sourceTokenPool);

//  // ChainUpdates + chain configurations etc.
//         TokenPool.ChainUpdate[] memory chains = new TokenPool.ChainUpdate[](2);
      
        
//         chains[0] = TokenPool.ChainUpdate({
//             remoteChainSelector: firstRemoteChainSelector,
//             remotePoolAddress: abi.encode(address(firstRemoteTokenPool)),
//             allowed:true,
//             remoteTokenAddress: abi.encode(firstRemoteToken),
//             outboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 1e24, rate: type(uint128).max}),
//             inboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 1e24, rate: type(uint128).max})
//         });

//           chains[1] = TokenPool.ChainUpdate({
//             remoteChainSelector: secondRemoteChainSelector,
//             remotePoolAddress: abi.encode(address(secondRemoteTokenPool)),
//             allowed:true,
//             remoteTokenAddress: abi.encode(secondRemoteToken),
//             outboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 1e24, rate: type(uint128).max}),
//             inboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 1e24, rate: type(uint128).max})
//         });
        
        
//         TokenPool(address(tokenPool)).applyChainUpdates(chains);
// }




// }