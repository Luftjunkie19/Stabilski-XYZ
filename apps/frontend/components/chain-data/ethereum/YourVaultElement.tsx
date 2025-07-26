/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethSepoliaVaultManagerAddress, vaultManagerAbi } from '@/lib/smart-contracts-abi/VaultManager'
import Image from 'next/image'
import React from 'react'
import { useReadContract } from 'wagmi'
import stabilskiStableCoin from '@/public/Logox32.png';
type Props = {
    depostior:`0x${string}`,
    tokenAddress:`0x${string}`
}

import {GiReceiveMoney, GiPayMoney} from 'react-icons/gi';
import RepayDialog from '@/components/dialogs/RepayDialog';
import WithdrawDialog from '@/components/dialogs/WithdrawDialog';


function VaultElement({depostior, tokenAddress}: Props) {
  
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
        functionName:'isLiquidatable',
        args:[depostior, tokenAddress],
    })

    if(vaultInfo as unknown as any[] && (vaultInfo as unknown as any[])[2] !== "0x0000000000000000000000000000000000000000" ){
        return (
            <>
            {vaultInfo as unknown as any[] && (vaultInfo as unknown as any[])[2] !== "0x0000000000000000000000000000000000000000" &&
        <div className={`w-full ${vaultInfo as unknown as any[] && (vaultInfo as unknown as any[])[2] === "0x0000000000000000000000000000000000000000" ? 'hidden' : 'flex'} flex-col sm:flex-row px-2 gap-1 flex sm:items-center justify-between`}>
    <div className="w-full">
        <p className='hidden md:block'>{depostior.slice(0, 21)}...</p>
    <p className='block md:hidden'>{depostior.slice(0, 10)}...</p>
    <div className="flex items-center gap-2">
    <div className="flex items-center ">
        <GiPayMoney className='mr-1' />
        <p className='text-sm'><span className='text-red-500'>
            {collateralValue as unknown as bigint && (Number((collateralValue as unknown as bigint))/1e18).toFixed(2)}
            </span> </p>
    <Image src={stabilskiStableCoin} alt='' width={64} height={64} className='w-6 h-6'/>
    </div>
       <GiReceiveMoney className='mr-1' />
        <div className="flex items-center ">
        <p className='text-sm'><span>{(Number((vaultInfo as unknown as any[])[1] as unknown as bigint)/1e18).toFixed(2)}</span></p>
    <Image src={stabilskiStableCoin} alt='' width={64} height={64} className='w-7 h-7'/>
    </div>
    <p className={` text-sm ${isLiquidatable as unknown as boolean && (isLiquidatable as unknown as boolean) ? 'text-red-500' : 'text-green-500' }`}>
        {healthData as unknown as bigint &&  Number((healthData as unknown as bigint)) &&
        Number((healthData as unknown as bigint))/1e16 < 1e3 ?
     `${(Number((healthData as unknown as bigint))/1e16).toFixed(2)}%`
        : "Overcollatirized"
        }
        </p>
    </div>
    </div>
    
    
    <div className='flex gap-1 items-end '>
   <RepayDialog/>
     <WithdrawDialog/>
    </div>

    
    
    
        </div>
            }
            </>
      )
    }
  
}

export default VaultElement