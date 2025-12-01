'use client';
import { ARBITRUM_SEPOLIA_CHAINID, BASE_SEPOLIA_CHAINID, SEPOLIA_ETH_CHAINID } from '@/lib/CollateralContractAddresses';
import { stabilskiTokenABI } from '@/lib/smart-contracts-abi/StabilskiToken';
import { usdplnOracleABI } from '@/lib/smart-contracts-abi/USDPLNOracle';
import { collateralInfoType, ethereumAddress, singleResultType } from '@/lib/types/onChainData/OnChainDataTypes';
import React from 'react'
import { FaBitcoin, FaEthereum } from 'react-icons/fa6';
import { SiChainlink } from 'react-icons/si';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import  StabilskiStableCoin  from '@/public/Logox192.png';
import Image from 'next/image'
import UserVaults from './UserVaults';
import ProtocolOnChainPositions from './ProtocolOnChainPositions';
import { Abi } from 'viem';
import PriceSkeleton from '../skeletons/PriceSkeleton';
import useBlockchainData from '@/lib/hooks/useBlockchainData';
import { MdCancel } from 'react-icons/md';

function OnChainDataContainer() {
  const {chainId, address}=useAccount();
  const {
    currentChainVaultManagerAddress,
    currentStabilskiContractAddress,
    currentOraclePriceAddress,
    currentStabilskiCollateralManagerAddress,
    chainVaultManagerContracts,
    chainCollateralPriceContracts,
    chainCollateralInfoContracts
  }=useBlockchainData();

  const tokenAddress = currentStabilskiContractAddress as ethereumAddress;
  const oracleAddress = currentOraclePriceAddress as ethereumAddress;
  const currentCollateralManagerAddress=currentStabilskiCollateralManagerAddress();
  const vaultManagerAddress= currentChainVaultManagerAddress
const vaultManagerContracts=chainVaultManagerContracts();
const collateralPriceOnChainContracts=chainCollateralPriceContracts();
const collateralInfoContracts= chainCollateralInfoContracts();


  const {data:vaultTokensOnchainData, isLoading:vaultTokensOnchainLoading,isError}=useReadContracts({
            contracts:vaultManagerContracts as readonly {
    abi?: Abi | undefined;
    functionName?: string | undefined;
    args?: readonly unknown[] | undefined;
    address?: `0x${string}` | undefined;
    chainId?: number | undefined;
}[]
        });
        
  const {data:collateralTokenPriceData, isLoading:collateralTokenPriceLoading, isError:collateralPriceError, error:collateralErrorMsg}=useReadContracts({contracts:collateralPriceOnChainContracts as 
    readonly {
    abi?: Abi | undefined;
    functionName?: string | undefined;
    args?: readonly unknown[] | undefined;
    address?: `0x${string}` | undefined;
    chainId?: number | undefined;
}[]
  });

  const {data:collateralInfos, isLoading:collateralInfosLoading, isError:collateralInfosPriceError }=useReadContracts({contracts:collateralInfoContracts as readonly {
    abi?: Abi | undefined;
    functionName?: string | undefined;
    args?: readonly unknown[] | undefined;
    address?: `0x${string}` | undefined;
    chainId?: number | undefined;
}[]});


  const {data:balancePLST, isLoading:balancePLSTLoading, isError:balancePLSTError, error:balancePLSTErrorMsg} = useReadContract(
            {
          abi:stabilskiTokenABI,
          address: tokenAddress,
          functionName:'balanceOf',
          args:[address],
          chainId
            }
        );

  const {data:oraclePrice, isLoading:oraclePriceLoading, isError:oraclePriceError}=useReadContract({
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
      {collateralTokenPriceLoading &&
    <div className="flex flex-col gap-2 w-full h-full">
  <p className='text-red-500'>Collateral Tokens</p>
<div className="w-full flex flex-wrap items-center gap-6">
<div className='flex text-sm items-center gap-1'>
  <FaBitcoin className='text-orange-500 text-base'/> 
<PriceSkeleton/>
</div>
<div className='flex text-sm items-center gap-1'><FaEthereum className='text-zinc-500 text-base'/> 
<PriceSkeleton/>
</div>
<div className='flex text-sm items-center gap-1'><SiChainlink className='text-blue-500 text-base'/> 
<PriceSkeleton/>
</div>

</div>

</div>
      }


{collateralPriceError && <p className='text-red-500'>
  {
    collateralErrorMsg.message
  }
</p>
}
    

      {!collateralTokenPriceLoading
      && collateralTokenPriceData && 
    <div className="flex flex-col gap-2 w-full h-full">
  <p className='text-red-500'>Collateral Tokens</p>
<div className="w-full flex flex-col gap-4">

<div className='flex p-2 rounded-lg justify-between bg-neutral-700 text-sm items-center gap-1'>

<div className="flex items-center gap-1">
    <FaBitcoin className='text-orange-500 text-base'/> 
    <p>Wrapped BTC</p>
</div>

<p className='text-sm'>{collateralTokenPriceData[0] && (Number(collateralTokenPriceData[0].result) / 1e18).toFixed(2)}$</p>
</div>

<div className='flex p-2 rounded-lg justify-between bg-neutral-700 text-sm items-center gap-1'>
 
 <div className="flex items-center gap-1">
   <FaEthereum className='text-zinc-500 text-base'/> 
   <p>Ethereum</p>
 </div>

<p className='text-sm'>{(collateralTokenPriceData[1] && Number(collateralTokenPriceData[1].result)/ 1e18).toFixed(2)}$</p>
</div>
<div className='flex p-2 rounded-lg justify-between bg-neutral-700 text-sm items-center gap-1'>
<div className="flex items-center gap-1">
  <SiChainlink className='text-blue-500 text-base'/> 
  <p>Chainlink</p>
</div>

<p>{collateralTokenPriceData[2] && (Number(collateralTokenPriceData[2].result) / 1e18).toFixed(2)}$</p>

</div>


</div>

</div>
      }
      </>)

    case ARBITRUM_SEPOLIA_CHAINID:
      return (<>

{collateralTokenPriceLoading
 && <div className="flex flex-col gap-2 w-full h-full">
  <p className='text-red-500'>Crypto Prices (USD)</p>
<div className="w-full flex flex-wrap items-center gap-6">
<div className='flex text-sm items-center gap-1'><SiChainlink className='text-blue-500 text-base'/> 
<PriceSkeleton/>
</div>
</div>

</div>}


{collateralPriceError && <p className='text-red-500'>
  {
    collateralErrorMsg.message
  }
</p>
}


      {!collateralTokenPriceLoading 
      && collateralTokenPriceData &&  <div className="flex flex-col gap-2 w-full h-full">
  <p className='text-red-500'>Crypto Prices (USD)</p>
<div className="w-full flex flex-wrap items-center gap-6">
<div className='flex text-sm items-center gap-1'><SiChainlink className='text-blue-500 text-base'/> 
<p>{collateralTokenPriceData[0] && (Number(collateralTokenPriceData[0].result) / 1e18).toFixed(2)}$</p>
</div>
</div>

</div>}
      </>)

    case BASE_SEPOLIA_CHAINID:
      return (<>
    {collateralTokenPriceLoading &&    <div className="flex flex-col gap-2 w-full h-full">
  <p className='text-red-500'>Crypto Prices (USD)</p>
<div className="w-full flex flex-wrap items-center gap-6">
<div className='flex text-sm items-center gap-1'>
<SiChainlink className='text-blue-500 text-base'/> 
<PriceSkeleton/>
</div>
<div className='flex text-sm items-center gap-1'>
<FaEthereum className='text-blue-800 text-base'/> 
<PriceSkeleton/>
</div>


</div>

</div>}

        {!collateralTokenPriceLoading && collateralTokenPriceData &&    <div className="flex flex-col gap-2 w-full h-full">
  <p className='text-red-500'>Crypto Prices (USD)</p>
<div className="w-full flex flex-wrap items-center gap-6">
<div className='flex text-sm items-center gap-1'>
<SiChainlink className='text-blue-500 text-base'/> 
<p className='text-sm'>{collateralTokenPriceData[0] && (Number(collateralTokenPriceData[0].result) / 1e18).toFixed(2)}$</p>
</div>
<div className='flex text-sm items-center gap-1'>
<FaEthereum className='text-blue-800 text-base'/> 
<p className='text-sm'>{(collateralTokenPriceData[1] && Number(collateralTokenPriceData[1].result)/ 1e18).toFixed(2)}$</p>
</div>


</div>

</div>}
      </>)

  }
}

const CollateralizationRates=()=>{
  switch(chainId){

    case SEPOLIA_ETH_CHAINID:
      return (
      <>
      {(collateralInfosLoading) && !collateralInfosPriceError
        && !collateralInfos && 
    <div className="flex flex-col gap-2 w-full h-full">
  <p className='text-red-500'>Collateralization Rate</p>
<div className="w-full flex flex-wrap items-center gap-6">
<div className='flex text-sm items-center gap-1'>
  <FaBitcoin className='text-orange-500 text-base'/> 
<PriceSkeleton/>
</div>
<div className='flex text-sm items-center gap-1'>
  <FaEthereum className='text-zinc-500 text-base'/> 
<PriceSkeleton/>
</div>
<div className='flex text-sm items-center gap-1'>
  <SiChainlink className='text-blue-500 text-base'/> 
<PriceSkeleton/>
</div>

</div>

</div>
      }

      {collateralInfosPriceError && <p className='text-red-500 flex items-center gap-2'>
        <MdCancel/>
        Error occured while loading rates.</p>}

      {!collateralTokenPriceLoading && !collateralInfosPriceError && collateralInfos &&
    <div className="flex flex-col gap-2 w-full h-full">
  <p className='text-red-500'>Collateralization Rate</p>
<div className="w-full flex gap-4">

<div className='flex p-2 text-sm items-center gap-1'>
    <FaBitcoin className='text-orange-500 text-base'/> 



<p className='text-sm'>{(collateralInfos as singleResultType<collateralInfoType>[])[0] && 
collateralInfos[0].result as collateralInfoType &&
(
  Number((collateralInfos[0].result as collateralInfoType)[1]
 ) / 1e16)}%</p>
</div>

<div className='flex p-2 text-sm items-center gap-1'>
 
   <FaEthereum className='text-zinc-500 text-base'/> 


<p className='text-sm'>{(collateralInfos[1]
  && (collateralInfos[1].result as collateralInfoType)
  && Number((collateralInfos[1].result as collateralInfoType)[1])/ 1e16)}%</p>
</div>

<div className='flex p-2 text-sm items-center gap-1'>

  <SiChainlink className='text-blue-500 text-base'/> 
 

<p>{collateralInfos[2] 
  && (collateralInfos[2].result as collateralInfoType)
&& (Number((collateralInfos[2].result as collateralInfoType)[1]) / 1e16)}%</p>

</div>


</div>

</div>
      }
      </>)

    case ARBITRUM_SEPOLIA_CHAINID:
      return (<>

{(collateralInfosLoading) && !collateralInfosPriceError
 && !collateralInfos && <div className="flex flex-col gap-2 w-full h-full">
  <p className='text-red-500'>Collateralization Rate</p>
<div className="w-full flex items-center gap-6">
<div className='flex text-sm items-center gap-1'><SiChainlink className='text-blue-500 text-base'/> 
<PriceSkeleton/>
</div>
</div>

</div>}


      {collateralInfosPriceError && <p className='text-red-500 flex items-center gap-2'>
        <MdCancel/>
        Error occured while loading rates.</p>}

      {!collateralInfosLoading && collateralInfos && collateralInfos as singleResultType<collateralInfoType>[] &&  <div className="flex flex-col gap-2 w-full h-full">
  <p className='text-red-500'>Collateralization Rate</p>
<div className="w-full flex items-center gap-6">
<div className='flex text-sm items-center gap-1'><SiChainlink className='text-blue-500 text-base'/> 
<p>{collateralInfos[0] && (Number((collateralInfos[0] as singleResultType<collateralInfoType>).result[1]) / 1e16)}%</p>
</div>
</div>

</div>}
      </>)

    case BASE_SEPOLIA_CHAINID:
      return (<>
    {(collateralInfosLoading) && !collateralInfosPriceError && !collateralInfos && <div className="flex flex-col gap-2 w-full h-full">
  <p className='text-red-500'>Collateralization Rate</p>
<div className="w-full flex items-center gap-6">
<div className='flex text-sm items-center gap-1'>
<SiChainlink className='text-blue-500 text-base'/> 
<PriceSkeleton/>
</div>
<div className='flex text-sm items-center gap-1'>
<FaEthereum className='text-blue-800 text-base'/> 
<PriceSkeleton/>
</div>


</div>

</div>}



      {collateralInfosPriceError && <p className='text-red-500 flex items-center gap-2'>
        <MdCancel/>
        Error occured while loading rates.</p>
        }

        {!collateralInfosLoading && !collateralInfosPriceError && collateralInfos &&    <div className="flex flex-col gap-2 w-full h-full">
  <p className='text-red-500'>Collateralization Rate</p>
<div className="w-full flex items-center gap-6">
<div className='flex text-sm items-center gap-1'>
<SiChainlink className='text-blue-500 text-base'/> 
<p className='text-sm'>{collateralInfos[0] && (Number((
collateralInfos[0] as singleResultType<collateralInfoType>).result[1]
) / 1e16)}%</p>
</div>
<div className='flex text-sm items-center gap-1'>
<FaEthereum className='text-blue-800 text-base'/> 
<p className='text-sm'>{(collateralInfos[1] && Number(
  (collateralInfos[1] as singleResultType<collateralInfoType>)
  .result[1])/ 1e16)}%</p>
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
{(vaultTokensOnchainLoading) && !isError && !vaultTokensOnchainData && <div  className="w-full flex items-center gap-6">
<div className='flex items-center gap-1'>
  <FaBitcoin className='text-orange-500'/> 
<PriceSkeleton/>
 <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} />
</div>
<div className='flex items-center gap-1'><FaEthereum className='text-zinc-500'/> 
<PriceSkeleton/>
 <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} />
 </div>
<div className='flex items-center gap-1'>
  <SiChainlink className='text-blue-500'/>
<PriceSkeleton/>
  <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} />
  </div>
</div>}



{isError && <p className='text-red-500 flex items-center gap-2'>
        <MdCancel/>
        Error occured while loading collateral balances...</p>}

      {!vaultTokensOnchainLoading && !isError && vaultTokensOnchainData && <div  className="w-full flex items-center flex-wrap gap-6">
<div className='flex items-center gap-1'>
  <FaBitcoin className='text-orange-500'/> 
  <p className='text-sm sm:text-base'>{vaultTokensOnchainData[0] && vaultTokensOnchainData[0].result as unknown as bigint && Number(vaultTokensOnchainData[0].result)  && (Number(vaultTokensOnchainData[0].result) / 1e18).toFixed(2)}</p>
 <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} />
</div>
<div className='flex items-center gap-1'><FaEthereum className='text-zinc-500'/> 
<p className='text-sm sm:text-base'>
{vaultTokensOnchainData[1] && vaultTokensOnchainData[1].result as unknown as bigint   && Number(vaultTokensOnchainData[1].result)  && (Number(vaultTokensOnchainData[1].result)/ 1e18).toFixed(2)}  
</p>
 <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} />
 </div>
<div className='flex items-center gap-1'>
  <SiChainlink className='text-blue-500'/>
  <p className='text-sm sm:text-base'>
   {vaultTokensOnchainData[2] && vaultTokensOnchainData[2].result as unknown as bigint && Number(vaultTokensOnchainData[2].result)  && (Number(vaultTokensOnchainData[2].result) / 1e18).toFixed(2)} 
  </p>
  <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} />
  </div>
</div>}
      </>)

    case BASE_SEPOLIA_CHAINID:
      return (<>
    {(vaultTokensOnchainLoading) && !isError && !vaultTokensOnchainData && <div  className="w-full flex-wrap flex items-center gap-6">
<div className='flex items-center gap-1'><FaEthereum className='text-zinc-500'/> <PriceSkeleton/>  <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} /></div>
<div className='flex items-center gap-1'><SiChainlink className='text-blue-500'/> <PriceSkeleton/> <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} /></div>
</div>}


{isError && <p className='text-red-500 flex items-center gap-2'>
        <MdCancel/>
        Error occured while loading collateral balances...</p>}


      {!vaultTokensOnchainLoading  && !isError && vaultTokensOnchainData && <div  className="w-full flex-wrap flex items-center gap-6">
<div className='flex items-center gap-1'><FaEthereum className='text-zinc-500'/> {vaultTokensOnchainData[1] && vaultTokensOnchainData[1].result as unknown as bigint   && Number(vaultTokensOnchainData[1].result)  && (Number(vaultTokensOnchainData[1].result)/ 1e18).toFixed(2)} <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} /></div>
<div className='flex items-center gap-1'><SiChainlink className='text-blue-500'/> {vaultTokensOnchainData[0]&& vaultTokensOnchainData[0].result as unknown as bigint && Number(vaultTokensOnchainData[0].result)  && (Number(vaultTokensOnchainData[0].result) / 1e18).toFixed(2)} <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} /></div>
</div>}
      </>)

     case ARBITRUM_SEPOLIA_CHAINID:
      return (<>
      {vaultTokensOnchainLoading && !isError && !vaultTokensOnchainData && <div  className="w-full flex-wrap  flex items-center gap-6">
<div className='flex items-center gap-1'><SiChainlink className='text-blue-500'/> <PriceSkeleton/> <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} /></div>
</div>}


{isError && <p className='text-red-500 flex items-center gap-2'>
        <MdCancel/>
        Error occured while loading collateral balances...</p>}

      {!vaultTokensOnchainLoading && !isError && vaultTokensOnchainData && <div  className="w-full flex-wrap  flex items-center gap-6">
<div className='flex items-center gap-1'><SiChainlink className='text-blue-500'/> {vaultTokensOnchainData[0] && vaultTokensOnchainData[0].result as unknown as bigint && Number(vaultTokensOnchainData[0].result)  && (Number(vaultTokensOnchainData[0].result) / 1e18).toFixed(2)} <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} /></div>
</div>}
      </>)

  }
}

  return (
<div className="w-full flex items-center justify-center flex-wrap gap-4">
   
        <div className="flex flex-col gap-3 overflow-y-auto max-w-md border w-full bg-neutral-800 text-white border-red-500 shadow-md shadow-black p-4 rounded-lg h-64">
<CollateralTokenPriceOnChainData/>
<CollateralizationRates/>
</div>

<div className="flex flex-col gap-3 overflow-y-auto max-w-md border w-full bg-neutral-800 text-white border-red-500 shadow-md shadow-black p-4 rounded-lg h-64">
 <div className="flex flex-col  gap-1">
<p className='text-red-500'>Your Collateral</p>
<UserCollaterals/>
</div>

  <div className='py-2 flex md:items-center flex-col md:flex-row items-start gap-2'>
  Your PLST Balance
  {balancePLSTLoading && <PriceSkeleton/>}
  {balancePLSTError && !balancePLST && <p className='text-red-500 text-sm line-clamp-1'>{balancePLSTErrorMsg.message}</p>  }
  {!balancePLSTLoading  && !balancePLSTError && balancePLST as unknown as bigint
   && <span
   className='text-red-500
   flex items-center gap-1' >
    {(Number(balancePLST) / 1e18).toFixed(2)}
  
   <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} />
   </span>  
   }
</div>

<div className="text-sm text-white sm:text-base tracking flex flex-row items-center gap-1">USD/PLN <span className='text-red-500 font-bold'>
{(oraclePriceLoading) && <PriceSkeleton/>}
{oraclePriceError && !oraclePrice && <p className='text-red-500 text-sm font-light line-clamp-1'>Could not retrieve USDPLN rate</p>}
{!oraclePriceLoading && !oraclePriceError && oraclePrice as unknown as bigint && (Number(oraclePrice) / 1e4).toFixed(4)}</span>

  </div>
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