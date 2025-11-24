import { vaultManagerAbi } from '@/lib/smart-contracts-abi/VaultManager';
import { ethereumAddress, vaultInfoReturnType } from '@/lib/types/onChainData/OnChainDataTypes';
import React from 'react'
import { GiPayMoney, GiReceiveMoney } from 'react-icons/gi';
import { toast } from 'sonner';
import { useReadContract, useWatchContractEvent } from 'wagmi';
import Image from "next/image";
import stabilskiStableCoin from '@/public/Logox32.png'
import RepayDialog from '@/components/dialogs/RepayDialog';
import WithdrawDialog from '@/components/dialogs/WithdrawDialog';

type Props = {vaultManagerAddress:ethereumAddress, depositor:ethereumAddress, tokenAddress:ethereumAddress,}

function UserVaultHandlePosition({vaultManagerAddress, depositor, tokenAddress}: Props) {
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
    })



    useWatchContractEvent({
  address: vaultManagerAddress,
  abi: vaultManagerAbi,
  eventName: 'DebtRepaid',
  onLogs: (logs) => {
    console.log('New logs!', logs);
    toast.success(`
Debt repaid successfully for ${depositor} PLST on ${tokenAddress} vault!
    `);
  },
  args:{
    vaultOwner: depositor,
    token: tokenAddress,
  },

});




    if(vaultInfo as unknown as vaultInfoReturnType && (vaultInfo as unknown as vaultInfoReturnType)[2] !== "0x0000000000000000000000000000000000000000" ){
        return (
            <>
            {vaultInfo as unknown as vaultInfoReturnType && (vaultInfo as vaultInfoReturnType)[2] !== "0x0000000000000000000000000000000000000000" &&
        <div className={`w-full ${vaultInfo as vaultInfoReturnType && (vaultInfo as vaultInfoReturnType)[2] === "0x0000000000000000000000000000000000000000" ? 'hidden' : 'flex'} flex-col sm:flex-row px-2 gap-1 flex sm:items-center justify-between`}>
    <div className="w-full">
        <p className='hidden md:block'>{depositor.slice(0, 21)}...</p>
    <p className='block md:hidden'>{depositor.slice(0, 10)}...</p>
    <div className="flex items-center gap-2 flex-wrap">
    <div className="flex items-center">
        <GiPayMoney className='mr-1' />
        <p className='text-sm'><span className='text-red-500'>
            {collateralValue as unknown as bigint && (Number((collateralValue as unknown as bigint))/1e18).toFixed(2)}
            </span> </p>
    <Image src={stabilskiStableCoin} alt='' width={64} height={64} className='w-6 h-6'/>
    </div>

        <div className="flex items-center gap-1">
       <GiReceiveMoney className='mr-1' />
        <p className='text-sm'><span>{(Number((vaultInfo as unknown as vaultInfoReturnType)[1] as unknown as bigint)/1e18).toFixed(2)}</span></p>
    <Image src={stabilskiStableCoin} alt='' width={64} height={64} className='w-7 h-7'/>
    </div>
    <p className={` text-sm ${isLiquidatable as unknown as boolean && (isLiquidatable as unknown as boolean) ? 'text-red-500' : 'text-green-500' }`}>
        {healthData as unknown as bigint &&  Number((healthData as unknown as bigint)) &&
        Number((healthData as unknown as bigint))/1e16 < 1e3 ?
     `${(Number((healthData as unknown as bigint))/1e16).toFixed(2)}%`
        : ">1000%"
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

export default UserVaultHandlePosition