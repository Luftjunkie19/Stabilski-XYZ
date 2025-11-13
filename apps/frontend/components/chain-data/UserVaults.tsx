import { stabilskiTokenCollateralManagerAbi } from '@/lib/smart-contracts-abi/CollateralManager';
import { ChainType, ethereumAddress } from '@/lib/types/onChainData/OnChainDataTypes';
import React from 'react'
import { useAccount, useReadContract } from 'wagmi';
import UserVaultHandlePosition from './element/UserVaultHandlePosition';

type Props = {
  collateralManagerAddress: ethereumAddress,
  chainId: number,
  vaultManager:ethereumAddress
}

function UserVaults({collateralManagerAddress, chainId, vaultManager}: Props) {
 const {address}=useAccount();
  const {data:collateralTokens}=useReadContract({
        abi: stabilskiTokenCollateralManagerAbi,
        address: collateralManagerAddress,
        functionName:'getCollateralTokens',
        args:[],
        chainId:chainId 
    });

  return (
    <div className='bg-white border p-2 rounded-lg border-red-500 shadow-md shadow-black max-w-xl w-full h-72 flex flex-col gap-2'>
        <p className='text-lg text-red-500'>Your Vaults</p>

        {address && <div className="flex flex-col gap-2">
            {collateralTokens as unknown as string[] && (collateralTokens as unknown as string[]).map((tokenAddr:string)=>(
    <UserVaultHandlePosition vaultManagerAddress={vaultManager} key={tokenAddr} depositor={address as `0x${string}`} tokenAddress={tokenAddr as `0x${string}`} />
))}
        </div>}
    </div>
  )
}

export default UserVaults