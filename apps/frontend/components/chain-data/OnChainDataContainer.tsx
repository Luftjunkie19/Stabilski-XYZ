import { ARBITRUM_SEPOLIA_CHAINID, ARBITRUM_SEPOLIA_LINK_ADDR, BASE_SEPOLIA_CHAINID, BASE_SEPOLIA_LINK_ADDR, BASE_SEPOLIA_WETH_ADDR, SEPOLIA_ETH_CHAINID, SEPOLIA_ETH_LINK_ADDR, SEPOLIA_ETH_WBTC_ADDR, SEPOLIA_ETH_WETH_ADDR } from '@/lib/CollateralContractAddresses';
import { stabilskiTokenABI, stabilskiTokenArbitrumSepoliaAddress, stabilskiTokenBaseSepoliaAddress, stabilskiTokenEthSepoliaAddress } from '@/lib/smart-contracts-abi/StabilskiToken';
import { usdplnOracleABI, usdplnOracleArbitrumSepoliaAddress, usdPlnOracleBaseSepoliaAddress, usdplnOracleEthSepoliaAddress } from '@/lib/smart-contracts-abi/USDPLNOracle';
import { ChainType, ethereumAddress } from '@/lib/types/onChainData/OnChainDataTypes';
import React from 'react'
import { FaBitcoin, FaEthereum } from 'react-icons/fa6';
import { SiChainlink } from 'react-icons/si';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import  StabilskiStableCoin  from '@/public/Logox192.png';
import Image from 'next/image'
import UserVaults from './UserVaults';
import ProtocolOnChainPositions from './ProtocolOnChainPositions';
import { stabilskiTokenArbitrumSepoliaCollateralManagerAddress, stabilskiTokenBaseSepoliaCollateralManagerAddress, stabilskiTokenCollateralManagerAbi, stabilskiTokenSepoliaEthCollateralManagerAddress } from '@/lib/smart-contracts-abi/CollateralManager';
import { arbitrumSepoliaVaultManagerAddress, baseSepoliaVaultManagerAddress, ethSepoliaVaultManagerAddress, vaultManagerAbi } from '@/lib/smart-contracts-abi/VaultManager';

function OnChainDataContainer() {
  const {chainId, address}=useAccount();


  const currentStabilskiTokenAddress=()=>{
    switch(chainId){

      case SEPOLIA_ETH_CHAINID:
        return stabilskiTokenEthSepoliaAddress
      
      case ARBITRUM_SEPOLIA_CHAINID:
        return stabilskiTokenArbitrumSepoliaAddress

      case BASE_SEPOLIA_CHAINID:
        return stabilskiTokenBaseSepoliaAddress
    }
  }

   const currentStabilskiOracleAddress=()=>{
    switch(chainId){

      case SEPOLIA_ETH_CHAINID:
        return usdplnOracleEthSepoliaAddress
      
      case ARBITRUM_SEPOLIA_CHAINID:
        return usdplnOracleArbitrumSepoliaAddress

      case BASE_SEPOLIA_CHAINID:
        return usdPlnOracleBaseSepoliaAddress
    }
  }

   const currentStabilskiCollateralManagerAddress=()=>{
    switch(chainId){

      case SEPOLIA_ETH_CHAINID:
        return stabilskiTokenSepoliaEthCollateralManagerAddress
      
      case ARBITRUM_SEPOLIA_CHAINID:
        return stabilskiTokenArbitrumSepoliaCollateralManagerAddress

      case BASE_SEPOLIA_CHAINID:
        return stabilskiTokenBaseSepoliaCollateralManagerAddress
    }
  }

     const currentStabilskiVaultManagerAddress=()=>{
    switch(chainId){

      case SEPOLIA_ETH_CHAINID:
        return ethSepoliaVaultManagerAddress
      
      case ARBITRUM_SEPOLIA_CHAINID:
        return arbitrumSepoliaVaultManagerAddress

      case BASE_SEPOLIA_CHAINID:
        return baseSepoliaVaultManagerAddress
    }
  }


  const tokenAddress = currentStabilskiTokenAddress();
  const oracleAddress = currentStabilskiOracleAddress();
  const currentCollateralManagerAddress=currentStabilskiCollateralManagerAddress();
  const vaultManagerAddress= currentStabilskiVaultManagerAddress(); 

  const chainVaultManagerContracts=()=>{
if(chainId === SEPOLIA_ETH_CHAINID){
  return [
                  {
                      'abi':vaultManagerAbi,
                      'address':vaultManagerAddress,
                      'functionName':'getCollateralValue',
                      'args':[address, SEPOLIA_ETH_WBTC_ADDR],
                      chainId:SEPOLIA_ETH_CHAINID
                  },
                  {
                      'abi':vaultManagerAbi,
                      'address':vaultManagerAddress,
                      'functionName':'getCollateralValue',
                      'args':[address, SEPOLIA_ETH_WETH_ADDR],
                      chainId:SEPOLIA_ETH_CHAINID
                  },
                  {
                    abi:vaultManagerAbi,
                    address:vaultManagerAddress,
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
                            'address':vaultManagerAddress,
                            'functionName':'getCollateralValue',
                            'args':[address, BASE_SEPOLIA_LINK_ADDR],
                            chainId:BASE_SEPOLIA_CHAINID
                        },
                        {
                            'abi':vaultManagerAbi,
                            'address':vaultManagerAddress,
                            'functionName':'getCollateralValue',
                            'args':[address, BASE_SEPOLIA_WETH_ADDR],
                            chainId:BASE_SEPOLIA_CHAINID
                        }, 
                    ]

}


      return [ {
                          'abi':vaultManagerAbi,
                          'address':vaultManagerAddress,
                          'functionName':'getCollateralValue',
                          'args':[address, ARBITRUM_SEPOLIA_LINK_ADDR],
                          chainId:ARBITRUM_SEPOLIA_CHAINID
                      }, 
                  ]
  
}
const vaultManagerContracts=chainVaultManagerContracts();

const chainCollateralContracts = ()=>{
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

const collateralPriceOnChainContracts=chainCollateralContracts();



  const {data:vaultTokensOnchainData}=useReadContracts({
            contracts:vaultManagerContracts as any[]
        });
        
  const {data:collateralTokenPriceData}=useReadContracts({contracts:collateralPriceOnChainContracts as any[]});

  const {data:balancePLST} = useReadContract(
            {
          abi:stabilskiTokenABI,
          address: tokenAddress,
          functionName:'balanceOf',
          args:[address],
          chainId
            }
        );

  const {data:oraclePrice}=useReadContract({
          abi:usdplnOracleABI,
          address: oracleAddress,
          functionName:'getPLNPrice',
          args:[],
          chainId
        });

const CollateralTokenPriceOnChainData=()=>{
  switch(chainId){

    case SEPOLIA_ETH_CHAINID:
      return (
      <>
      {collateralTokenPriceData && 
    <div className="flex flex-col gap-2 w-full h-full">
  <p className='text-red-500'>Crypto Prices (USD)</p>
<div className="w-full flex flex-wrap items-center gap-6">
<div className='flex text-sm items-center gap-1'>
  <FaBitcoin className='text-orange-500 text-base'/> 
<p className='text-sm'>{collateralTokenPriceData[0] && (Number(collateralTokenPriceData[0].result) / 1e18).toFixed(2)}</p>
</div>
<div className='flex text-sm items-center gap-1'><FaEthereum className='text-zinc-500 text-base'/> 
<p className='text-sm'>{(collateralTokenPriceData[1] && Number(collateralTokenPriceData[1].result)/ 1e18).toFixed(2)}</p>
</div>
<div className='flex text-sm items-center gap-1'><SiChainlink className='text-blue-500 text-base'/> 
<p>{collateralTokenPriceData[2] && (Number(collateralTokenPriceData[2].result) / 1e18).toFixed(2)}</p>
</div>

</div>

</div>
      }
      </>)

    case ARBITRUM_SEPOLIA_CHAINID:
      return (<>
      {collateralTokenPriceData &&  <div className="flex flex-col gap-2 w-full h-full">
  <p className='text-red-500'>Crypto Prices (USD)</p>
<div className="w-full flex flex-wrap items-center gap-6">
<div className='flex text-sm items-center gap-1'><SiChainlink className='text-blue-500 text-base'/> 
<p>{collateralTokenPriceData[0] && (Number(collateralTokenPriceData[0].result) / 1e18).toFixed(2)}</p>
</div>
</div>

</div>}
      </>)

    case BASE_SEPOLIA_CHAINID:
      return (<>
        {collateralTokenPriceData &&    <div className="flex flex-col gap-2 w-full h-full">
  <p className='text-red-500'>Crypto Prices (USD)</p>
<div className="w-full flex flex-wrap items-center gap-6">
<div className='flex text-sm items-center gap-1'>
<SiChainlink className='text-blue-500 text-base'/> 
<p className='text-sm'>{collateralTokenPriceData[0] && (Number(collateralTokenPriceData[0].result) / 1e18).toFixed(2)}</p>
</div>
<div className='flex text-sm items-center gap-1'>
<FaEthereum className='text-blue-800 text-base'/> 
<p className='text-sm'>{(collateralTokenPriceData[1] && Number(collateralTokenPriceData[1].result)/ 1e18).toFixed(2)}</p>
</div>


</div>

</div>}
      </>)

  }
}

const UserCollaterals=()=>{
  switch(chainId){

    case SEPOLIA_ETH_CHAINID:
      return (<>

      {vaultTokensOnchainData && <div  className="w-full flex items-center gap-6">
<div className='flex items-center gap-1'>
  <FaBitcoin className='text-orange-500'/> {vaultTokensOnchainData[0] && vaultTokensOnchainData[0].result as unknown as bigint && Number(vaultTokensOnchainData[0].result)  && (Number(vaultTokensOnchainData[0].result) / 1e18).toFixed(2)}
 
</div>
<div className='flex items-center gap-1'><FaEthereum className='text-zinc-500'/> {vaultTokensOnchainData[1] && vaultTokensOnchainData[1].result as unknown as bigint   && Number(vaultTokensOnchainData[1].result)  && (Number(vaultTokensOnchainData[1].result)/ 1e18).toFixed(2)} <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} /></div>
<div className='flex items-center gap-1'><SiChainlink className='text-blue-500'/> {vaultTokensOnchainData[2] && vaultTokensOnchainData[2].result as unknown as bigint && Number(vaultTokensOnchainData[2].result)  && (Number(vaultTokensOnchainData[2].result) / 1e18).toFixed(2)} <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} /></div>
</div>}
      </>)

    case BASE_SEPOLIA_CHAINID:
      return (<>
      {vaultTokensOnchainData && <div  className="w-full flex items-center gap-6">
<div className='flex items-center gap-1'><FaEthereum className='text-zinc-500'/> {vaultTokensOnchainData[1] && vaultTokensOnchainData[0].result as unknown as bigint   && Number(vaultTokensOnchainData[0].result)  && (Number(vaultTokensOnchainData[0].result)/ 1e18).toFixed(2)} <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} /></div>
<div className='flex items-center gap-1'><SiChainlink className='text-blue-500'/> {vaultTokensOnchainData[2] && vaultTokensOnchainData[1].result as unknown as bigint && Number(vaultTokensOnchainData[1].result)  && (Number(vaultTokensOnchainData[1].result) / 1e18).toFixed(2)} <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} /></div>
</div>}
      </>)

     case ARBITRUM_SEPOLIA_CHAINID:
      return (<>
      {vaultTokensOnchainData && <div  className="w-full flex items-center gap-6">
<div className='flex items-center gap-1'><SiChainlink className='text-blue-500'/> {vaultTokensOnchainData[2] && vaultTokensOnchainData[0].result as unknown as bigint && Number(vaultTokensOnchainData[0].result)  && (Number(vaultTokensOnchainData[0].result) / 1e18).toFixed(2)} <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} /></div>
</div>}
      </>)

  }
}

  return (
<div className="w-full flex items-center justify-center flex-wrap gap-4">
        <div className="flex flex-col overflow-y-auto gap-3 max-w-md w-full bg-white border-red-500 border-1 shadow-md shadow-black p-4 rounded-lg h-64">
  {collateralTokenPriceData && 
<CollateralTokenPriceOnChainData/>
}


{chainId && vaultTokensOnchainData &&
<div className="flex flex-col overflow-y-auto gap-1">
<p className='text-red-500'>Your Collateral</p>
<UserCollaterals/>
</div>
}


<p className='py-2 flex md:items-center flex-col md:flex-row items-start gap-2'>
  Your PLST Balance: {balancePLST as unknown as bigint
   && <span
   className='text-red-500
   flex items-center gap-1
   '
   >
    {(Number(balancePLST) / 1e18).toFixed(2)}
   <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} />
   </span>
    
   }
</p>

<p className="text-sm text-zinc-500 sm:text-base tracking">USD/PLN <span className='text-red-500 font-bold'>{oraclePrice as unknown as bigint && (Number(oraclePrice) / 1e4).toFixed(4)} PLN</span></p>

</div>

{vaultManagerAddress && currentCollateralManagerAddress && <>
<ProtocolOnChainPositions chainId={chainId as number} vaultManagerAddress={vaultManagerAddress as ethereumAddress} collateralManagerAddress={currentCollateralManagerAddress as ethereumAddress} />

<UserVaults collateralManagerAddress={currentCollateralManagerAddress as ethereumAddress} chainId={chainId as number} vaultManager={vaultManagerAddress as ethereumAddress} />
</>
}


</div>

  )
}

export default OnChainDataContainer