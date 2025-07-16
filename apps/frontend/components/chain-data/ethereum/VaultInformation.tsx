/* eslint-disable @typescript-eslint/no-explicit-any */
import { arbitrumSepoliaVaultManagerAddress, ethSepoliaVaultManagerAddress, vaultManagerAbi } from '@/lib/smart-contracts-abi/VaultManager'
import Image from 'next/image'
import React from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import stabilskiStableCoin from '@/public/Logox32.png';
import { Button } from '@/components/ui/button';
import { ARBITRUM_SEPOLIA_CHAINID } from '@/lib/CollateralContractAddresses';
import { stabilskiTokenABI } from '@/lib/smart-contracts-abi/StabilskiToken';
import { toast } from 'sonner';

type Props = {
    depostior:`0x${string}`,
    tokenAddress:`0x${string}`
}

function VaultInformation({depostior, tokenAddress}: Props) {
    const {writeContract}=useWriteContract({});
    const { chainId, address}=useAccount();
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
        <div className={`w-full ${vaultInfo as unknown as any[] && (vaultInfo as unknown as any[])[2] === "0x0000000000000000000000000000000000000000" ? 'hidden' : 'flex'} flex items-center justify-between`}>
    <div className="">
        <p className='hidden md:block'>{depostior.slice(0, 21)}...</p>
    <p className='block md:hidden'>{depostior.slice(0, 10)}...</p>
    <div className="flex items-center gap-2">
    <div className="flex items-center ">
        <p className='text-sm'><span className='text-red-500'>
            {collateralValue as unknown as bigint && (Number((collateralValue as unknown as bigint))/1e18).toFixed(2)}
            </span> </p>
    <Image src={stabilskiStableCoin} alt='' width={64} height={64} className='w-6 h-6'/>
    </div>
    <p className={`text-sm ${isLiquidatable as unknown as boolean && (isLiquidatable as unknown as boolean) ? 'text-red-500' : 'text-green-500' }`}>{healthData as unknown as bigint && (Number((healthData as unknown as bigint))/1e16).toFixed(2)}%</p>
    </div>
    </div>
    
    
    <div className='flex flex-col items-end w-full'>
    
    <div className="flex items-center">
        <p className='text-sm'><span>{Number((vaultInfo as unknown as any[])[1] as unknown as bigint)/1e18}</span></p>
    <Image src={stabilskiStableCoin} alt='' width={64} height={64} className='w-8 h-8'/>
    </div>

    <Button onClick={()=>{
        if((isLiquidatable as unknown as boolean) && (isLiquidatable as unknown as boolean) === true){  
            console.log(isLiquidatable as unknown as boolean && (isLiquidatable as unknown as boolean));
    writeContract({
        chainId,
        address: chainId === ARBITRUM_SEPOLIA_CHAINID ? arbitrumSepoliaVaultManagerAddress : ethSepoliaVaultManagerAddress,
        abi:stabilskiTokenABI,
        functionName:'approve',
        args:[address, 111e18],
    });
    
            writeContract({
                chainId,
                address: chainId === ARBITRUM_SEPOLIA_CHAINID ? arbitrumSepoliaVaultManagerAddress : ethSepoliaVaultManagerAddress,
                abi:vaultManagerAbi,
                functionName:'liquidateVault',
                args:[depostior, tokenAddress],
            });
            return;
        }
        toast.error("Vault is not liquidatable");
    }} variant={'destructive'} className={`${isLiquidatable as unknown as boolean && (isLiquidatable as unknown as boolean) ?  'bg-red-500 cursor-pointer' : 'bg-red-800 cursor-not-allowed'}  hover:bg-red-800 hover:scale-95`} disabled={isLiquidatable as unknown as boolean && (isLiquidatable as unknown as boolean) === false ? true : false}>Liquidate</Button>
    
    
    </div>
    
    
        </div>
            }
            </>
      )
    }
  
}

export default VaultInformation