
import { useChainId } from 'wagmi'
import { ARBITRUM_SEPOLIA_ABI, ARBITRUM_SEPOLIA_CHAINID, ARBITRUM_SEPOLIA_LINK_ADDR, BASE_SEPOLIA_CHAINID, BASE_SEPOLIA_LINK_ABI, BASE_SEPOLIA_LINK_ADDR, BASE_SEPOLIA_WETH_ABI, BASE_SEPOLIA_WETH_ADDR, SEPOLIA_ETH_CHAINID, SEPOLIA_ETH_LINK_ABI, SEPOLIA_ETH_LINK_ADDR, SEPOLIA_ETH_WBTC_ABI, SEPOLIA_ETH_WBTC_ADDR, SEPOLIA_ETH_WETH_ABI, SEPOLIA_ETH_WETH_ADDR } from '../CollateralContractAddresses';
import { ethSepoliaVaultManagerAddress, arbitrumSepoliaVaultManagerAddress, baseSepoliaVaultManagerAddress } from '../smart-contracts-abi/VaultManager';
import { usdplnOracleArbitrumSepoliaAddress, usdPlnOracleBaseSepoliaAddress, usdplnOracleEthSepoliaAddress } from '../smart-contracts-abi/USDPLNOracle';
import { stabilskiTokenArbitrumSepoliaAddress, stabilskiTokenBaseSepoliaAddress, stabilskiTokenEthSepoliaAddress } from '../smart-contracts-abi/StabilskiToken';
import { arbitrumSepoliaRouter, baseSepoliaRouter, ethereumSepoliaRouter } from '../smart-contracts-abi/ccip-routers/Router';
import { ccipInformationRetrieverSepoliaEthAddress, ccipInformationRetrieverSepoliaArbAddress, ccipInformationRetrieverSepoliaBaseAddress, chainSelectorBaseSepolia, stabilskiTokenPoolBaseSepolia, chainSelectorArbitrumSepolia, chainSelectorSepoliaEth, stabilskiTokenPoolArbSepolia, stabilskiTokenPoolEthSepolia } from '../smart-contracts-abi/ccip-routers/StabilskiTokenCCIPNeededData';

function useBlockchainData() {
 const chainId = useChainId();
 
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



return {
    getTokenAbi, currentChainVaultManagerAddress, currentOraclePriceAddress,
    getPoolAddressByChainSelector,getCurrentPoolAddress,
    currentStabilskiContractAddress, getCurrentRouter, 
    getCurrentCcipRetriever}     


}

export default useBlockchainData