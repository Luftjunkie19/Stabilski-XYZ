'use client';

import React from 'react'
import { useAccount, useReadContract } from 'wagmi';
import { stabilskiTokenCollateralManagerAbi, stabilskiTokenArbitrumSepoliaCollateralManagerAddress } from '@/lib/smart-contracts-abi/CollateralManager';
import VaultElement from './YourVaultElement';
import { ARBITRUM_SEPOLIA_CHAINID } from '@/lib/CollateralContractAddresses';


function YourVaults() {
    const {address}=useAccount();
  const {data:collateralTokens}=useReadContract({
        abi: stabilskiTokenCollateralManagerAbi,
        address: stabilskiTokenArbitrumSepoliaCollateralManagerAddress,
        functionName:'getCollateralTokens',
        args:[],
        chainId:ARBITRUM_SEPOLIA_CHAINID
    });

  return (
    <div className='bg-white border p-2 rounded-lg border-red-500 shadow-md shadow-black max-w-xl w-full h-72 flex flex-col gap-2'>
        <p className='text-lg text-red-500'>Your Vaults (Arbitrum Sepolia)</p>

        {address && <div className="flex flex-col gap-2">
            {collateralTokens as unknown as string[] && (collateralTokens as unknown as string[]).map((tokenAddr:string)=>(
    <VaultElement key={tokenAddr} depostior={address as `0x${string}`} tokenAddress={tokenAddr as `0x${string}`} />
))}
        </div>}
    </div>
  )
}

export default YourVaults