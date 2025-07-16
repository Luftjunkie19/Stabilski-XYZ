import { stabilskiTokenArbitrumSepoliaCollateralManagerAddress, stabilskiTokenCollateralManagerAbi } from '@/lib/smart-contracts-abi/CollateralManager';
import React from 'react'
import { useReadContract } from 'wagmi'
import DepositorElement from './DepositorElement';
import { ARBITRUM_SEPOLIA_CHAINID } from '@/lib/CollateralContractAddresses';

function DepositsCard() {;

    const {data:collateralTokens}=useReadContract({
        abi: stabilskiTokenCollateralManagerAbi,
        address: stabilskiTokenArbitrumSepoliaCollateralManagerAddress,
        functionName:'getCollateralTokens',
        args:[],
        chainId: ARBITRUM_SEPOLIA_CHAINID
    });




    return (
   <div className="flex flex-col gap-6 max-w-lg w-full bg-white border-red-500 border-1 shadow-md shadow-black overflow-y-auto overflow-x-hidden p-4 rounded-lg h-64">
{collateralTokens as unknown as string[] && (collateralTokens as unknown as string[]).map((tokenAddr:string)=>(
    <DepositorElement key={tokenAddr} tokenAddress={tokenAddr} />
))}

</div>
  )
}

export default DepositsCard