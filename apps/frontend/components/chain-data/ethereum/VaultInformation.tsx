/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethSepoliaVaultManagerAddress, vaultManagerAbi } from '@/smart-contracts-abi/VaultManager'
import Image from 'next/image'
import React from 'react'
import { useReadContract } from 'wagmi'
import stabilskiStableCoin from '@/public/Logox32.png';
type Props = {
    depostior:`0x${string}`,
    tokenAddress:`0x${string}`
}

function VaultInformation({depostior, tokenAddress}: Props) {
  
    const {data:collateralValue}=useReadContract({
        abi: vaultManagerAbi,
        address: ethSepoliaVaultManagerAddress,
        functionName:'getCollateralValue',
        args:[depostior, tokenAddress],
    });

    const {data:vaultInfo}=useReadContract({
        abi: vaultManagerAbi,
        address: ethSepoliaVaultManagerAddress,
        functionName:'getVaultInfo',
        args:[depostior, tokenAddress],
    });

    const {data:healthData}=useReadContract({
        abi: vaultManagerAbi,
        address: ethSepoliaVaultManagerAddress,
        functionName:'getVaultHealthFactor',
        args:[depostior, tokenAddress],
    });

    const {data:isLiquidatable}=useReadContract({
        abi: vaultManagerAbi,
        address: ethSepoliaVaultManagerAddress,
        functionName:'isVaultLiquidatable',
        args:[depostior, tokenAddress],
    })

  
    return (
    <div className='w-full flex items-center justify-between'>
<div className="">
    <p className='hidden md:block'>{depostior.slice(0, 21)}...</p>
<p className='block md:hidden'>{depostior.slice(0, 10)}...</p>
<div className="flex items-center gap-2">
    <p>Colateral: {collateralValue as unknown as bigint && (Number((collateralValue as unknown as bigint))/1e18).toFixed(2)} </p>
<Image src={stabilskiStableCoin} alt='' width={64} height={64} className='w-8 h-8'/>
</div>
</div>

{vaultInfo as unknown as any[] && (vaultInfo as unknown as any[])[3] !== "0x0000000000000000000000000000000000000000" &&
<div className='flex flex-col'>

<div className="flex items-center gap-2">
    <p>Debt: <span>{Number((vaultInfo as unknown as any[])[1] as unknown as bigint)/1e18}</span></p>
<Image src={stabilskiStableCoin} alt='' width={64} height={64} className='w-8 h-8'/>
</div>

<p className={`self-end ${isLiquidatable as unknown as boolean && (isLiquidatable as unknown as boolean) ? 'text-red-500' : 'text-green-500' }`}>{healthData as unknown as bigint && (Number((healthData as unknown as bigint))/1e16)}%</p>
</div>
}

    </div>
  )
}

export default VaultInformation