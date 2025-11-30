
import { useAccount, useChainId } from 'wagmi'
import { ARBITRUM_SEPOLIA_ABI, ARBITRUM_SEPOLIA_CHAINID, ARBITRUM_SEPOLIA_LINK_ADDR, BASE_SEPOLIA_CHAINID, BASE_SEPOLIA_LINK_ABI, BASE_SEPOLIA_LINK_ADDR, BASE_SEPOLIA_WETH_ABI, BASE_SEPOLIA_WETH_ADDR, SEPOLIA_ETH_CHAINID, SEPOLIA_ETH_LINK_ABI, SEPOLIA_ETH_LINK_ADDR, SEPOLIA_ETH_WBTC_ABI, SEPOLIA_ETH_WBTC_ADDR, SEPOLIA_ETH_WETH_ABI, SEPOLIA_ETH_WETH_ADDR } from '../CollateralContractAddresses';
import { ethSepoliaVaultManagerAddress, arbitrumSepoliaVaultManagerAddress, baseSepoliaVaultManagerAddress, vaultManagerAbi } from '../smart-contracts-abi/VaultManager';
import { usdplnOracleArbitrumSepoliaAddress, usdPlnOracleBaseSepoliaAddress, usdplnOracleEthSepoliaAddress } from '../smart-contracts-abi/USDPLNOracle';
import { stabilskiTokenArbitrumSepoliaAddress, stabilskiTokenBaseSepoliaAddress, stabilskiTokenEthSepoliaAddress } from '../smart-contracts-abi/StabilskiToken';
import { arbitrumSepoliaRouter, baseSepoliaRouter, ethereumSepoliaRouter } from '../smart-contracts-abi/ccip/Router';
import { ccipInformationRetrieverSepoliaEthAddress, ccipInformationRetrieverSepoliaArbAddress, ccipInformationRetrieverSepoliaBaseAddress, chainSelectorBaseSepolia, stabilskiTokenPoolBaseSepolia, chainSelectorArbitrumSepolia, chainSelectorSepoliaEth, stabilskiTokenPoolArbSepolia, stabilskiTokenPoolEthSepolia } from '../smart-contracts-abi/ccip/StabilskiTokenCCIPNeededData';
import { stabilskiTokenArbitrumSepoliaCollateralManagerAddress, stabilskiTokenBaseSepoliaCollateralManagerAddress, stabilskiTokenCollateralManagerAbi, stabilskiTokenSepoliaEthCollateralManagerAddress } from '../smart-contracts-abi/CollateralManager';

function useBlockchainData() {
 const chainId = useChainId();
 const {address}=useAccount();
 
     const getTokenAbi=(token:string)=>{
       switch(token){
 
         case SEPOLIA_ETH_WETH_ADDR:
           return SEPOLIA_ETH_WETH_ABI
 
         case SEPOLIA_ETH_WBTC_ADDR:
           return SEPOLIA_ETH_WBTC_ABI
 
         case SEPOLIA_ETH_LINK_ADDR:
           return SEPOLIA_ETH_LINK_ABI
 
           case ARBITRUM_SEPOLIA_LINK_ADDR:
             return ARBITRUM_SEPOLIA_ABI
 
           case BASE_SEPOLIA_WETH_ADDR:
             return BASE_SEPOLIA_WETH_ABI
 
           case BASE_SEPOLIA_LINK_ADDR:
             return BASE_SEPOLIA_LINK_ABI
 
         }
     }


     const currentChainVaultManager=()=>{
         switch(chainId){
     case SEPOLIA_ETH_CHAINID:
       return ethSepoliaVaultManagerAddress;
       
       case ARBITRUM_SEPOLIA_CHAINID:
         return arbitrumSepoliaVaultManagerAddress
     
       case BASE_SEPOLIA_CHAINID:
         return baseSepoliaVaultManagerAddress
         }
       }
     
       const currentChainVaultManagerAddress=currentChainVaultManager();


           const currentUsdPlnOracle=()=>{
             switch(chainId){
               case SEPOLIA_ETH_CHAINID:
                 return usdplnOracleEthSepoliaAddress
               case ARBITRUM_SEPOLIA_CHAINID:
                 return usdplnOracleArbitrumSepoliaAddress
               case BASE_SEPOLIA_CHAINID:
                 return usdPlnOracleBaseSepoliaAddress
             }
           }

           const currentOraclePriceAddress= currentUsdPlnOracle();



           const getCurrentStabilskiContractAddress=()=>{
            switch(chainId){
                case ARBITRUM_SEPOLIA_CHAINID:
                    return stabilskiTokenArbitrumSepoliaAddress

                case BASE_SEPOLIA_CHAINID:
                    return stabilskiTokenBaseSepoliaAddress

                case SEPOLIA_ETH_CHAINID:
                    return stabilskiTokenEthSepoliaAddress

            }

           }

           const currentStabilskiContractAddress = getCurrentStabilskiContractAddress();

           const getCurrentRouter= ()=>{
             switch(chainId){
               case ARBITRUM_SEPOLIA_CHAINID:
                 return arbitrumSepoliaRouter
               
               case BASE_SEPOLIA_CHAINID:
                 return baseSepoliaRouter
           
               case SEPOLIA_ETH_CHAINID:
               return ethereumSepoliaRouter
             }
           }
           
           const getCurrentCcipRetriever= ()=>{
             switch(chainId){
               case SEPOLIA_ETH_CHAINID:
                 return ccipInformationRetrieverSepoliaEthAddress
               
               case ARBITRUM_SEPOLIA_CHAINID:
                 return ccipInformationRetrieverSepoliaArbAddress
           
               case BASE_SEPOLIA_CHAINID:
               return ccipInformationRetrieverSepoliaBaseAddress
             }
           }


                 const getCurrentPoolAddress= ()=>{
             switch(chainId){
               case SEPOLIA_ETH_CHAINID:
                 return stabilskiTokenPoolEthSepolia
               
               case ARBITRUM_SEPOLIA_CHAINID:
                 return stabilskiTokenArbitrumSepoliaAddress
           
               case BASE_SEPOLIA_CHAINID:
               return stabilskiTokenPoolBaseSepolia
             }
           }

           const getPoolAddressByChainSelector=(chainSelector:string)=>{
            switch(chainSelector){
                case chainSelectorBaseSepolia.toString():
                    return stabilskiTokenPoolBaseSepolia

                case chainSelectorArbitrumSepolia.toString():
                    return stabilskiTokenPoolArbSepolia

                case chainSelectorSepoliaEth.toString():
                    return stabilskiTokenPoolEthSepolia
                }
           }


           const getCurrentBlockchainScanner=()=>{
            switch(chainId){
                case SEPOLIA_ETH_CHAINID:
                    return 'https://sepolia.etherscan.io/'

                case ARBITRUM_SEPOLIA_CHAINID:
                    return 'https://sepolia.arbiscan.io/'
                
                case BASE_SEPOLIA_CHAINID:
                    return 'https://https://sepolia.basescan.org/'
            }
           }

           const currentBlockchainScanner=getCurrentBlockchainScanner();


           
           
              const currentStabilskiCollateralManagerAddress=()=>{
               switch(chainId){
           
                 case SEPOLIA_ETH_CHAINID:
                   return stabilskiTokenSepoliaEthCollateralManagerAddress
                 
                 case ARBITRUM_SEPOLIA_CHAINID:
                   return stabilskiTokenArbitrumSepoliaCollateralManagerAddress
           
                 case BASE_SEPOLIA_CHAINID:
                   return stabilskiTokenSepoliaEthCollateralManagerAddress
               }
             }
           
              const chainVaultManagerContracts=()=>{
             if(chainId === SEPOLIA_ETH_CHAINID){
               return [
                               {
                                   'abi':vaultManagerAbi,
                                   'address':currentChainVaultManagerAddress,
                                   'functionName':'getCollateralValue',
                                   'args':[address, SEPOLIA_ETH_WBTC_ADDR],
                                   chainId:SEPOLIA_ETH_CHAINID
                               },
                               {
                                   'abi':vaultManagerAbi,
                                   'address':currentChainVaultManagerAddress,
                                   'functionName':'getCollateralValue',
                                   'args':[address, SEPOLIA_ETH_WETH_ADDR],
                                   chainId:SEPOLIA_ETH_CHAINID
                               },
                               {
                                 abi:vaultManagerAbi,
                                 address:currentChainVaultManagerAddress,
                                 functionName:'getCollateralValue',
                                 args:[address, SEPOLIA_ETH_LINK_ADDR],
                                 chainId:SEPOLIA_ETH_CHAINID
                               }
                               
                           ];
             
             }
             
             if(chainId === BASE_SEPOLIA_CHAINID){
               
                     return [
                                     {
                                         'abi':vaultManagerAbi,
                                         'address':currentChainVaultManagerAddress,
                                         'functionName':'getCollateralValue',
                                         'args':[address, BASE_SEPOLIA_LINK_ADDR],
                                         chainId:BASE_SEPOLIA_CHAINID
                                     },
                                     {
                                         'abi':vaultManagerAbi,
                                         'address':currentChainVaultManagerAddress,
                                         'functionName':'getCollateralValue',
                                         'args':[address, BASE_SEPOLIA_WETH_ADDR],
                                         chainId:BASE_SEPOLIA_CHAINID
                                     }, 
                                 ]
             
             }
             
             
                   return [ {
                                       'abi':vaultManagerAbi,
                                       'address':currentChainVaultManagerAddress,
                                       'functionName':'getCollateralValue',
                                       'args':[address, ARBITRUM_SEPOLIA_LINK_ADDR],
                                       chainId:ARBITRUM_SEPOLIA_CHAINID
                                   }, 
                               ]
               
             }
             
             const chainCollateralPriceContracts = ()=>{
             switch(chainId){
               case SEPOLIA_ETH_CHAINID:
                 return [
                    {
                          'abi':stabilskiTokenCollateralManagerAbi,
                         'address':stabilskiTokenSepoliaEthCollateralManagerAddress,
                         'functionName':'getTokenPrice',
                         'args':[SEPOLIA_ETH_WBTC_ADDR],
                         chainId:SEPOLIA_ETH_CHAINID
                     },
                         {
                          'abi':stabilskiTokenCollateralManagerAbi,
                         'address':stabilskiTokenSepoliaEthCollateralManagerAddress,
                         'functionName':'getTokenPrice',
                         'args':[SEPOLIA_ETH_WETH_ADDR],
                         chainId:SEPOLIA_ETH_CHAINID
                     },
                         {
                          'abi':stabilskiTokenCollateralManagerAbi,
                         'address':stabilskiTokenSepoliaEthCollateralManagerAddress,
                         'functionName':'getTokenPrice',
                         'args':[SEPOLIA_ETH_LINK_ADDR],
                         chainId:SEPOLIA_ETH_CHAINID
                     }
                     ]
             
                 case ARBITRUM_SEPOLIA_CHAINID:
                   return [
                    {
                          'abi':stabilskiTokenCollateralManagerAbi,
                         'address':stabilskiTokenArbitrumSepoliaCollateralManagerAddress,
                         'functionName':'getTokenPrice',
                         'args':[ARBITRUM_SEPOLIA_LINK_ADDR],
                         chainId:ARBITRUM_SEPOLIA_CHAINID
                     }
                     ]
             
                   case BASE_SEPOLIA_CHAINID:
                     return [
                     {
                          'abi':stabilskiTokenCollateralManagerAbi,
                         'address':stabilskiTokenBaseSepoliaCollateralManagerAddress,
                         'functionName':'getTokenPrice',
                         'args':[BASE_SEPOLIA_LINK_ADDR],
                         chainId:BASE_SEPOLIA_CHAINID
                     },
                       {
                          'abi':stabilskiTokenCollateralManagerAbi,
                         'address':stabilskiTokenBaseSepoliaCollateralManagerAddress,
                         'functionName':'getTokenPrice',
                         'args':[BASE_SEPOLIA_WETH_ADDR],
                         chainId:BASE_SEPOLIA_CHAINID
                     }
                     ]
             
             }
             
             }

             const chainCollateralInfoContracts = ()=>{
             switch(chainId){
               case SEPOLIA_ETH_CHAINID:
                 return [
                    {
                          'abi':stabilskiTokenCollateralManagerAbi,
                         'address':stabilskiTokenSepoliaEthCollateralManagerAddress,
                         'functionName':'getCollateralInfo',
                         'args':[SEPOLIA_ETH_WBTC_ADDR],
                         chainId:SEPOLIA_ETH_CHAINID
                     },
                         {
                          'abi':stabilskiTokenCollateralManagerAbi,
                         'address':stabilskiTokenSepoliaEthCollateralManagerAddress,
                         'functionName':'getCollateralInfo',
                         'args':[SEPOLIA_ETH_WETH_ADDR],
                         chainId:SEPOLIA_ETH_CHAINID
                     },
                         {
                          'abi':stabilskiTokenCollateralManagerAbi,
                         'address':stabilskiTokenSepoliaEthCollateralManagerAddress,
                         'functionName':'getCollateralInfo',
                         'args':[SEPOLIA_ETH_LINK_ADDR],
                         chainId:SEPOLIA_ETH_CHAINID
                     }
                     ]
             
                 case ARBITRUM_SEPOLIA_CHAINID:
                   return [
                    {
                          'abi':stabilskiTokenCollateralManagerAbi,
                         'address':stabilskiTokenArbitrumSepoliaCollateralManagerAddress,
                         'functionName':'getCollateralInfo',
                         'args':[ARBITRUM_SEPOLIA_LINK_ADDR],
                         chainId:ARBITRUM_SEPOLIA_CHAINID
                     }
                     ]
             
                   case BASE_SEPOLIA_CHAINID:
                     return [
                     {
                          'abi':stabilskiTokenCollateralManagerAbi,
                         'address':stabilskiTokenBaseSepoliaCollateralManagerAddress,
                         'functionName':'getCollateralInfo',
                         'args':[BASE_SEPOLIA_LINK_ADDR],
                         chainId:BASE_SEPOLIA_CHAINID
                     },
                       {
                          'abi':stabilskiTokenCollateralManagerAbi,
                         'address':stabilskiTokenBaseSepoliaCollateralManagerAddress,
                         'functionName':'getCollateralInfo',
                         'args':[BASE_SEPOLIA_WETH_ADDR],
                         chainId:BASE_SEPOLIA_CHAINID
                     }
                     ]
             
             }
             
             }
             


             




return {
    getTokenAbi, currentChainVaultManagerAddress, currentOraclePriceAddress,
    getPoolAddressByChainSelector,getCurrentPoolAddress,
    currentStabilskiContractAddress, getCurrentRouter, currentBlockchainScanner,
    getCurrentCcipRetriever, currentStabilskiCollateralManagerAddress,
     chainVaultManagerContracts,chainCollateralPriceContracts,
     chainCollateralInfoContracts
  }     


}

export default useBlockchainData