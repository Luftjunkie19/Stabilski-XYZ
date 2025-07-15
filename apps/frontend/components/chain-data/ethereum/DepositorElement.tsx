import { ethSepoliaVaultManagerAddress, vaultManagerAbi } from '@/smart-contracts-abi/VaultManager';
import React from 'react'
import { useReadContract } from 'wagmi';
import VaultInformation from './VaultInformation';

type Props = {tokenAddress: string}

function DepositorElement({tokenAddress}: Props) {

const {data:depositors}=useReadContract({
        abi: vaultManagerAbi,
        address: ethSepoliaVaultManagerAddress,
        functionName:'getAllBorrowers',
        args:[]
    });

  return (
    <>
{depositors as unknown as string[] && (depositors as unknown as string[]).map((depositor:string)=>(<VaultInformation key={depositor} depostior={depositor as `0x${string}`} tokenAddress={tokenAddress as `0x${string}`}/>))}
    </>
  )
}

export default DepositorElement