/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import {  ARBITRUM_SEPOLIA_CHAINID, ARBITRUM_SEPOLIA_LINK_ADDR } from '@/lib/CollateralContractAddresses';
import { stabilskiTokenArbitrumSepoliaCollateralManagerAddress, stabilskiTokenCollateralManagerAbi } from '@/smart-contracts-abi/CollateralManager';
import { arbitrumSepoliaVaultManagerAddress, vaultManagerAbi } from '@/smart-contracts-abi/VaultManager';
import React from 'react'
import { SiChainlink } from 'react-icons/si'
import { useAccount, useReadContract } from 'wagmi';
import Image from 'next/image';
import StabilskiStableCoin from '@/public/Logox32.png';
import { stabilskiTokenABI, stabilskiTokenArbitrumSepoliaAddress } from '@/smart-contracts-abi/StabilskiToken';
import YourVaults from './YourVaults';
import DepositsCard from './DepositsCard';

function ArbitrumDataWidget() {
const { address}=useAccount();

const {data:collateralTokenPriceData}=useReadContract( {
                 'abi':stabilskiTokenCollateralManagerAbi,
                'address':stabilskiTokenArbitrumSepoliaCollateralManagerAddress,
                'functionName':'getTokenPrice',
                'args':[ARBITRUM_SEPOLIA_LINK_ADDR],
                chainId:ARBITRUM_SEPOLIA_CHAINID
});

        const {data:stabilskiBalance}=useReadContract({
            abi:stabilskiTokenABI,
            address: stabilskiTokenArbitrumSepoliaAddress,
            functionName:'balanceOf',
            args:[address],
            chainId:ARBITRUM_SEPOLIA_CHAINID
        });

const {data:arbitrumSepoliaCollateralData}=useReadContract({
        abi:vaultManagerAbi,
        address:arbitrumSepoliaVaultManagerAddress,
        functionName:'getVaultInfo',
        args:[address,  ARBITRUM_SEPOLIA_LINK_ADDR],
        chainId:ARBITRUM_SEPOLIA_CHAINID
    });


  return (
<div className='flex items-center flex-wrap justify-center gap-3 w-full'>
     <div className="flex flex-col gap-3 max-w-sm w-full
    bg-white p-4 rounded-lg border-red-500 border-1 shadow-md shadow-black h-64">
  <p>Arbitrum Sepolia Onchain Info</p>
  {collateralTokenPriceData as unknown as bigint && 
<div className="flex flex-col gap-2">
<div  className="w-full flex flex-col gap-2">
  <p>Crypto Prices (USD)</p>
<div className='flex items-center gap-1'><SiChainlink className='text-blue-500'/> {collateralTokenPriceData as unknown as bigint && (Number((collateralTokenPriceData as unknown as bigint)) / 1e18).toFixed(2)} $</div>
</div>

<div className="flex flex-col gap-1">
  <p>Your Vault Collaterals:</p>
  {arbitrumSepoliaCollateralData as unknown as any[] && 
   <div className='flex items-center gap-1'>
    <SiChainlink className='text-blue-500'/>
    <p>{(Number((arbitrumSepoliaCollateralData as unknown as any[])[0])/1e18).toFixed(2)}</p>
    </div>
  }
</div>

<div className="flex  gap-1">
  <p>Your PLST Balance:</p>
{stabilskiBalance as unknown as bigint && <div className='flex items-center gap-1'>
  <p className='text-red-500'>{(Number((stabilskiBalance as unknown as bigint)) / 1e18).toFixed(2)}</p>
  <Image src={StabilskiStableCoin} width={32} height={32} alt='' className='w-6 h-6'/>
  </div>}
</div>

</div>
}


</div>


<DepositsCard />
<YourVaults/>

</div>
  )
}

export default ArbitrumDataWidget