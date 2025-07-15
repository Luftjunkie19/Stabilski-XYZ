'use client';

import React from 'react'
import VaultInformation from './VaultInformation'
import { useAccount, useReadContract } from 'wagmi';
import { stabilskiTokenCollateralManagerAbi, stabilskiTokenSepoliaEthCollateralManagerAddress } from '@/smart-contracts-abi/CollateralManager';
import VaultElement from './YourVaultElement';


function YourVaults() {
    const {address}=useAccount();
  const {data:collateralTokens}=useReadContract({
        abi: stabilskiTokenCollateralManagerAbi,
        address: stabilskiTokenSepoliaEthCollateralManagerAddress,
        functionName:'getCollateralTokens',
        args:[]
    });

  return (
    <div className='bg-white border p-2 rounded-lg border-red-500 shadow-md shadow-black max-w-xl w-full h-72'>
        <p className='text-lg text-red-500 font-bold'>Your Vaults (Ethereum Sepolia)</p>

        {address && <div className="flex flex-col gap-2">
            {collateralTokens as unknown as string[] && (collateralTokens as unknown as string[]).map((tokenAddr:string)=>(
    <VaultElement key={tokenAddr} depostior={address as `0x${string}`} tokenAddress={tokenAddr as `0x${string}`} />
))}
        </div>}
    </div>
  )
}

export default YourVaults