import { arbitrumSepoliaVaultManagerAddress, vaultManagerAbi } from '@/lib/smart-contracts-abi/VaultManager';
import React from 'react'
import { useReadContract } from 'wagmi';
import VaultInformation from './VaultInformation';
import { ARBITRUM_SEPOLIA_CHAINID } from '@/lib/CollateralContractAddresses';

type Props = {tokenAddress: string}

function DepositorElement({tokenAddress}: Props) {

const {data:depositors}=useReadContract({
        abi: vaultManagerAbi,
        address: arbitrumSepoliaVaultManagerAddress,
        functionName:'getAllBorrowers',
        args:[],
        chainId:ARBITRUM_SEPOLIA_CHAINID
    });

  return (
    <>
{depositors as unknown as string[] && (depositors as unknown as string[]).map((depositor:string)=>(<VaultInformation key={depositor} depostior={depositor as `0x${string}`} tokenAddress={tokenAddress as `0x${string}`}/>))}
    </>
  )
}

export default DepositorElement