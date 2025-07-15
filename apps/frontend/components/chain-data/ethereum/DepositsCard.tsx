import { stabilskiTokenCollateralManagerAbi, stabilskiTokenSepoliaEthCollateralManagerAddress } from '@/smart-contracts-abi/CollateralManager';
import React from 'react'
import { useReadContract, useReadContracts } from 'wagmi'
import DepositorElement from './DepositorElement';

function DepositsCard() {

    const {data}=useReadContracts();

    const {data:collateralTokens}=useReadContract({
        abi: stabilskiTokenCollateralManagerAbi,
        address: stabilskiTokenSepoliaEthCollateralManagerAddress,
        functionName:'getCollateralTokens',
        args:[]
    });

     




    return (
   <div className="flex flex-col gap-6 max-w-lg w-full bg-white border-red-500 border-1 shadow-md shadow-black overflow-y-auto overflow-x-hidden p-4 rounded-lg h-64">
{collateralTokens as unknown as string[] && (collateralTokens as unknown as string[]).map((tokenAddr:string)=>(<div key={tokenAddr}>
    <DepositorElement tokenAddress={tokenAddr} />

</div>))}

</div>
  )
}

export default DepositsCard