import { stabilskiTokenABI } from '@/lib/smart-contracts-abi/StabilskiToken';
import { vaultManagerAbi } from '@/lib/smart-contracts-abi/VaultManager';
import { ethereumAddress, vaultInfoReturnType } from '@/lib/types/onChainData/OnChainDataTypes';
import React from 'react'
import { toast } from 'sonner';
import Image from "next/image";
import { useAccount, useReadContract, useWatchContractEvent, useWriteContract } from 'wagmi';
import stabilskiStableCoin from "@/public/Logox32.png"
import LiquidateDialog from '@/components/dialogs/LiquidateDialog';
import useBlockchainData from '@/lib/hooks/useBlockchainData';

type Props = {
  depositor:ethereumAddress,
  tokenAddress:ethereumAddress,
  vaultManagerAddress:ethereumAddress,
  collateralManagerAddress:ethereumAddress,
}

function VaultTokenPosition({depositor, tokenAddress, vaultManagerAddress}: Props) {
 const {writeContract}=useWriteContract({});
    const { chainId, address}=useAccount();
    const {data:collateralValue}=useReadContract({
        abi: vaultManagerAbi,
        address: vaultManagerAddress,
        functionName:'getCollateralValue',
        args:[depositor, tokenAddress],
    });

    const {data:vaultInfo}=useReadContract({
        abi: vaultManagerAbi,
        address: vaultManagerAddress,
        functionName:'getVaultInfo',
        args:[depositor, tokenAddress],
    });

    const {data:healthData}=useReadContract({
        abi: vaultManagerAbi,
        address: vaultManagerAddress,
        functionName:'getVaultHealthFactor',
        args:[depositor, tokenAddress],
    });

    const {data:isLiquidatable}=useReadContract({
        abi: vaultManagerAbi,
        address: vaultManagerAddress,
        functionName:'isLiquidatable',
        args:[depositor, tokenAddress],
    });


    const approvePLST=()=>{

        if(depositor === address){
            toast.error('Bro cmon, you cannot liquidate yourself XD');
            return;
        }

        if((isLiquidatable as unknown as boolean) && (isLiquidatable as unknown as boolean) === true){  
                 writeContract({
        chainId,
        address: tokenAddress,
        abi:stabilskiTokenABI,
        functionName:'approve',
        args:[address, (vaultInfo as vaultInfoReturnType)[1]],
    });
    return;
}

toast.error('Vault is not yet liquidateable.')

    }

    const commitLiquidation= ()=>{
        if((isLiquidatable as unknown as boolean) && (isLiquidatable as unknown as boolean) === true){  
            console.log(isLiquidatable as unknown as boolean && (isLiquidatable as unknown as boolean));

            writeContract({
                chainId,
                address: vaultManagerAddress,
                abi:vaultManagerAbi,
                functionName:'liquidateVault',
                args:[depositor, tokenAddress],
            });
            return;
        }
        toast.error("Vault is not liquidatable");
    }

    const {currentStabilskiContractAddress, currentChainVaultManagerAddress}=useBlockchainData();

    const {data:stabilskiUserBalance}=useReadContract({
        abi: stabilskiTokenABI,
        address: currentStabilskiContractAddress as ethereumAddress,
        functionName:'balanceOf',
        args:[address]
    });

    useWatchContractEvent({
        address:currentStabilskiContractAddress as ethereumAddress,
        abi:stabilskiTokenABI,
        eventName:'Approval',
        'args':{
            owner:address,
            spender: currentChainVaultManagerAddress
        },
        'onError':(error)=>{
            toast.error(error.message);
        },
        onLogs:(logs)=>{
            console.log(logs);
            toast.success('Stabilski Tokens Approved Correctly !')
        }
    })

    
    if(vaultInfo as unknown as vaultInfoReturnType && (vaultInfo as unknown as vaultInfoReturnType)[2] !== "0x0000000000000000000000000000000000000000" ){
        return (
            <>
            {vaultInfo as unknown as vaultInfoReturnType && (vaultInfo as unknown as vaultInfoReturnType)[2] !== "0x0000000000000000000000000000000000000000" &&
        <div
        className={`w-full ${vaultInfo as unknown as vaultInfoReturnType && (vaultInfo as unknown as vaultInfoReturnType)[2] === "0x0000000000000000000000000000000000000000" ? 'hidden' : 'flex'} flex-col sm:flex-row items-center sm:justify-between`}>
    <div className="w-full">
        <p className='hidden md:block'>{depositor.slice(0, 21)}...</p>
    <p className='block md:hidden'>{depositor.slice(0, 10)}...</p>
    <div className="flex items-center gap-2">
    <div className="flex items-center ">
        <p className='text-sm'><span className='text-red-500'>
            {collateralValue as unknown as bigint && (Number((collateralValue as unknown as bigint))/1e18).toFixed(2)}
            </span> </p>
    <Image src={stabilskiStableCoin} alt='' width={64} height={64} className='w-6 h-6'/>
    </div>
    <p className={`text-sm ${isLiquidatable as unknown as boolean && (isLiquidatable as unknown as boolean) ? 'text-red-500' : 'text-green-500' }`}>
     {healthData as unknown as bigint &&  Number((healthData as unknown as bigint)) &&
        Number((healthData as unknown as bigint))/1e16 < 1e3 ?
     `${(Number((healthData as unknown as bigint))/1e16).toFixed(2)}%`
        : ">1000%"
        }
    </p>
    </div>
    </div>
    
    <div className='flex justify-between sm:flex-col items-end w-full'>
    
    <div className="flex items-center">
        <p className='text-sm'><span>{(Number((vaultInfo as unknown as vaultInfoReturnType)[1] as unknown as bigint)/1e18).toFixed(2)}</span></p>
    <Image src={stabilskiStableCoin} alt='' width={64} height={64} className='w-8 h-8'/>
    </div>

   <LiquidateDialog approvePLST={approvePLST} userBalance={stabilskiUserBalance as unknown as bigint} vaultDebt={(vaultInfo as vaultInfoReturnType)[1]} commitLiquidation={commitLiquidation} isLiquidatable={isLiquidatable as unknown as boolean}/>
    
    
    </div>
    
    
        </div>
            }
            </>
      )
    }
}

export default VaultTokenPosition