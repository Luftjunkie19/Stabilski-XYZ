import { stabilskiTokenCollateralManagerAbi, stabilskiTokenSepoliaEthCollateralManagerAddress } from '@/lib/smart-contracts-abi/CollateralManager';
import React from 'react'
import { useReadContract } from 'wagmi'
import DepositorElement from './DepositorElement';
import { SEPOLIA_ETH_CHAINID } from '@/lib/CollateralContractAddresses';
import { ethSepoliaVaultManagerAddress, vaultManagerAbi } from '@/lib/smart-contracts-abi/VaultManager';
import VaultInformation from './VaultInformation';
import { FaMagnifyingGlass } from 'react-icons/fa6';

function DepositsCard() {;

    const {data:collateralTokens}=useReadContract({
        abi: stabilskiTokenCollateralManagerAbi,
        address: stabilskiTokenSepoliaEthCollateralManagerAddress,
        functionName:'getCollateralTokens',
        args:[],
        chainId: SEPOLIA_ETH_CHAINID
    });


    const {data:depositors}=useReadContract({
        abi: vaultManagerAbi,
        address: ethSepoliaVaultManagerAddress,
        functionName:'getAllBorrowers',
        args:[]
    });




    return (
        
   <div onClick={()=>console.log(collateralTokens)} className="flex flex-col gap-2 max-w-lg w-full bg-white border-red-500 border-1 shadow-md shadow-black overflow-y-auto overflow-x-hidden p-3 rounded-lg h-64">
    <p className='text-lg text-red-500'>Users Positions</p>

{depositors as unknown as string[] && (depositors as unknown as string[]).length === 0 && <div className='w-full flex flex-col gap-4 justify-center items-center h-full'>
    
     <p className='text-red-500 font-bold text-base'>No Deposits Yet Commited</p>
     <FaMagnifyingGlass className='text-red-500 text-4xl'/>
     <p className='text-xs font-semibold'>Deposit some tokens and feel the real power of Stabilski !</p>
    </div>}

{collateralTokens as unknown as string[] && depositors as unknown as string[] && (depositors as unknown as string[]).length > 0  &&  (collateralTokens as unknown as string[]).length > 0 && (collateralTokens as unknown as string[]).map((tokenAddr:string)=>(
<>
{  (depositors as unknown as string[]).map((depositor:string)=>(<VaultInformation key={depositor} depostior={depositor as `0x${string}`} tokenAddress={tokenAddr as `0x${string}`}/>))}
</>
))}



</div>
  )
}

export default DepositsCard