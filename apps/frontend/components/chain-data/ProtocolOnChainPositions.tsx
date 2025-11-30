'use client';
import { stabilskiTokenCollateralManagerAbi } from '@/lib/smart-contracts-abi/CollateralManager';
import { vaultManagerAbi } from '@/lib/smart-contracts-abi/VaultManager';
import { ethereumAddress } from '@/lib/types/onChainData/OnChainDataTypes';
import React from 'react'
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { useReadContract } from 'wagmi';
import ListOfPositions from './ListOfPositions';
import PositionSkeleton from '../skeletons/PositionSkeleton';

type Props = {
  collateralManagerAddress: ethereumAddress,
  vaultManagerAddress: ethereumAddress,
  chainId:number
}

function ProtocolOnChainPositions({ collateralManagerAddress, vaultManagerAddress, chainId}: Props) {

const UserPostions=()=>{
return <>
{(collateralTokens as unknown as ethereumAddress[]).map((tokenAddr:ethereumAddress, index)=>(
<ListOfPositions key={index} 
collateralManagerAddress={collateralManagerAddress} 
depositors={depositors as ethereumAddress[]} 
vaultManagerAddress={vaultManagerAddress}
 tokenAddr={tokenAddr as ethereumAddress}/>)
)}
</>

}
      const {data:collateralTokens, isLoading:collateralTokensLoading}=useReadContract({
          abi: stabilskiTokenCollateralManagerAbi,
          address: collateralManagerAddress,
          functionName:'getCollateralTokens',
          args:[],
          chainId
      });
  
  
      const {data:depositors, isLoading:depositorLoading}=useReadContract({
          abi: vaultManagerAbi,
          address: vaultManagerAddress,
          functionName:'getAllBorrowers',
          args:[],
          chainId
      });
  

  return (
  <div className="flex flex-col gap-2 max-w-lg w-full bg-neutral-800 border-red-500 border shadow-md shadow-black overflow-x-hidden p-3 rounded-lg h-64">
    <p className='text-lg text-red-500'>Users Positions</p>

        <div className="w-full h-full overflow-y-auto flex flex-col gap-2">
          {(collateralTokensLoading || depositorLoading) && (!collateralTokens || !depositors) && <>
          <PositionSkeleton />
          <PositionSkeleton />
          <PositionSkeleton />
          <PositionSkeleton />
          </>}
{depositors as unknown as string[] && (depositors as unknown as string[]).length === 0 && <div className='w-full flex flex-col gap-4 justify-center items-center h-full'>
    
     <p className='text-red-500 font-bold text-base'>No Deposits Yet Commited</p>
     <FaMagnifyingGlass className='text-red-500 text-4xl'/>
     <p className='text-xs text-white font-light'>Deposit some tokens and feel the real power of Stabilski !</p>
    </div>}

{collateralTokens as unknown as ethereumAddress[] && depositors as unknown as ethereumAddress[] && (depositors as unknown as ethereumAddress[]).length > 0  &&  (collateralTokens as unknown as ethereumAddress[]).length > 0 && 
<UserPostions/>
}
        </div>

</div>
  )
}

export default ProtocolOnChainPositions