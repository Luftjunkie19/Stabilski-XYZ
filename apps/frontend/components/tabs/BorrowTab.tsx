'use client';

import React, { useState } from 'react'
import { TabsContent } from '../ui/tabs'
import { Label } from '../ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select'
import { FaEthereum, FaBitcoin } from 'react-icons/fa6'
import { SiChainlink } from 'react-icons/si'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { useAccount, useReadContracts, useSwitchChain, useWatchContractEvent, useWriteContract } from 'wagmi'
import {  ARBITRUM_SEPOLIA_ABI, ARBITRUM_SEPOLIA_CHAINID, ARBITRUM_SEPOLIA_LINK_ADDR, BASE_SEPOLIA_CHAINID, BASE_SEPOLIA_LINK_ABI, BASE_SEPOLIA_LINK_ADDR, BASE_SEPOLIA_WETH_ABI, BASE_SEPOLIA_WETH_ADDR, SEPOLIA_ETH_CHAINID, SEPOLIA_ETH_LINK_ABI, SEPOLIA_ETH_LINK_ADDR, SEPOLIA_ETH_WBTC_ABI, SEPOLIA_ETH_WBTC_ADDR, SEPOLIA_ETH_WETH_ABI, SEPOLIA_ETH_WETH_ADDR } from '@/lib/CollateralContractAddresses';
import { arbitrumSepoliaVaultManagerAddress, baseSepoliaVaultManagerAddress, ethSepoliaVaultManagerAddress, vaultManagerAbi } from '@/lib/smart-contracts-abi/VaultManager';
import OnChainDataContainer from '../chain-data/OnChainDataContainer';
import useBlockchainData from '@/lib/hooks/useBlockchainData';
import { CollateralDeposited, ethereumAddress, EventType, singleResultType } from '@/lib/types/onChainData/OnChainDataTypes';
import usePreventInvalidInput from '@/lib/hooks/usePreventInvalidInput';
import useToastContent from '@/lib/hooks/useToastContent';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as z from 'zod';



function BorrowTab() {

  useSwitchChain({mutation:{
    onSuccess:()=>{
reset();
      setMaximumAmount(0);
    }
  }});

const {writeContract}=useWriteContract({
});
const {handleKeyDown, handlePaste, handleBlur, handleChange}=usePreventInvalidInput();



const { sendToastContent}=useToastContent();

const {chainId, address}=useAccount();
  const [maximumAmount, setMaximumAmount] = useState<number>(0);


   const borrowPlstType = z.object({
    amount: z.number().gt(0, {'error':'The amount deposited must be greater than 0'}).max(maximumAmount, {error:'Deposited amount cannot surpass '}),
    collateralAddress: z.string().startsWith('0x', {message:"The selected token address hasn't been "}).length(42, {'message':'You selected invalid collateral token.'})
  }).required();

 const {register, handleSubmit, watch,reset, setValue, formState }=useForm<z.infer<typeof borrowPlstType>>({
  mode:'all'
 });

   const {errors}=formState;
 
    const arrayOfContracts =[
       {
             'abi':SEPOLIA_ETH_WBTC_ABI,
            'address':SEPOLIA_ETH_WBTC_ADDR,
            'functionName':'balanceOf',
            'args':[address],
            chainId:SEPOLIA_ETH_CHAINID
        },
            {
             'abi':SEPOLIA_ETH_WETH_ABI,
            'address':SEPOLIA_ETH_WETH_ADDR,
            'functionName':'balanceOf',
            'args':[address],
            chainId:SEPOLIA_ETH_CHAINID
        },
            {
             'abi':SEPOLIA_ETH_LINK_ABI,
            'address':SEPOLIA_ETH_LINK_ADDR,
            'functionName':'balanceOf',
            'args':[address],
            chainId:SEPOLIA_ETH_CHAINID
        },
         {
             'abi':ARBITRUM_SEPOLIA_ABI,
            'address':ARBITRUM_SEPOLIA_LINK_ADDR,
            'functionName':'balanceOf',
            'args':[address],
            chainId:ARBITRUM_SEPOLIA_CHAINID
        },
         {
             'abi':BASE_SEPOLIA_LINK_ABI,
            'address':BASE_SEPOLIA_LINK_ADDR,
            'functionName':'balanceOf',
            'args':[address],
            chainId:BASE_SEPOLIA_CHAINID
        },
           {
             'abi':BASE_SEPOLIA_WETH_ABI,
            'address':BASE_SEPOLIA_WETH_ADDR,
            'functionName':'balanceOf',
            'args':[address],
            chainId:BASE_SEPOLIA_CHAINID
        }
    ];

    const {data:vaultContractInfo}=useReadContracts({
        contracts:[
            {
                'abi':vaultManagerAbi,
                'address':ethSepoliaVaultManagerAddress,
                'functionName':'getCollateralValue',
                'args':[address, SEPOLIA_ETH_WBTC_ADDR],
                chainId:SEPOLIA_ETH_CHAINID
            },
            {
                'abi':vaultManagerAbi,
                'address':ethSepoliaVaultManagerAddress,
                'functionName':'getCollateralValue',
                'args':[address, SEPOLIA_ETH_WETH_ADDR],
                chainId:SEPOLIA_ETH_CHAINID
            },
            {
              abi:vaultManagerAbi,
              address:ethSepoliaVaultManagerAddress,
              functionName:'getCollateralValue',
              args:[address, SEPOLIA_ETH_LINK_ADDR],
              chainId:SEPOLIA_ETH_CHAINID
            },
              {
              abi:vaultManagerAbi,
              address:arbitrumSepoliaVaultManagerAddress,
              functionName:'getCollateralValue',
              args:[address, ARBITRUM_SEPOLIA_LINK_ADDR],
              chainId:ARBITRUM_SEPOLIA_CHAINID
            }
            
        ]
    });

    const {data:maxBorrowableData}=useReadContracts({
      contracts:[
        {
            'abi':vaultManagerAbi,
            'address':ethSepoliaVaultManagerAddress,
            'functionName':'getMaxBorrowableStabilskiTokens',
            'args':[address, SEPOLIA_ETH_WBTC_ADDR],
            chainId:SEPOLIA_ETH_CHAINID
        },
        {
            'abi':vaultManagerAbi,
            'address':ethSepoliaVaultManagerAddress,
            'functionName':'getMaxBorrowableStabilskiTokens',
            'args':[address, SEPOLIA_ETH_WETH_ADDR],
            chainId:SEPOLIA_ETH_CHAINID
        },
        {
          abi:vaultManagerAbi,
          address:ethSepoliaVaultManagerAddress,
          functionName:'getMaxBorrowableStabilskiTokens',
          args:[address, SEPOLIA_ETH_LINK_ADDR],
          chainId:SEPOLIA_ETH_CHAINID
        },
        {
          abi:vaultManagerAbi,
          address:arbitrumSepoliaVaultManagerAddress,
          functionName:'getMaxBorrowableStabilskiTokens',
          args:[address, ARBITRUM_SEPOLIA_LINK_ADDR],
          chainId:ARBITRUM_SEPOLIA_CHAINID
        },
          {
          abi:vaultManagerAbi,
          address:baseSepoliaVaultManagerAddress,
          functionName:'getMaxBorrowableStabilskiTokens',
          args:[address, BASE_SEPOLIA_LINK_ADDR],
          chainId:BASE_SEPOLIA_CHAINID
        },
        {
          abi:vaultManagerAbi,
          address:baseSepoliaVaultManagerAddress,
          functionName:'getMaxBorrowableStabilskiTokens',
          args:[address, BASE_SEPOLIA_WETH_ADDR],
          chainId:BASE_SEPOLIA_CHAINID
        }
      ]
    });


    const {currentChainVaultManagerAddress}=useBlockchainData();


useWatchContractEvent({
  address: currentChainVaultManagerAddress as ethereumAddress,
  abi:vaultManagerAbi,
  eventName:'StabilskiTokenMinted',
  chainId:chainId,
onLogs:(logs)=>{
  sendToastContent({
    toastText:`You successfully borrowed ${
   Number((logs[0] as EventType<Omit<CollateralDeposited,'token'>
    >).args?.amount)
    / 1e18} PLST`,
    icon:'✅',
    type:'success'
  })
},
args:{
  vaultOwner: address,
  amount: watch('amount') ? BigInt(watch('amount') * 10 ** 18) : 0,
},
enabled: typeof watch('amount') === 'number'
});


const TokensOptions = ()=>{
 switch(chainId){
    case SEPOLIA_ETH_CHAINID:
      return(<>
 
        <SelectItem className="flex text-white focus:bg-neutral-800 focus:text-white hover:bg-neutral-900 items-center gap-2 p-1" value={SEPOLIA_ETH_WETH_ADDR}> <FaEthereum className="text-zinc-500"/> <span className="text-sm">Wrapped Ethereum (WETH)</span></SelectItem>
    <SelectItem className="flex text-white focus:bg-neutral-800 focus:text-white hover:bg-neutral-900 items-center gap-2 p-1"  value={SEPOLIA_ETH_WBTC_ADDR}><FaBitcoin className="text-orange-500"/> <span className="text-sm">Wrapped Bitcoin (WBTC)</span></SelectItem>
    <SelectItem className="flex text-white focus:bg-neutral-800 focus:text-white hover:bg-neutral-900 items-center gap-2 p-1"  value={SEPOLIA_ETH_LINK_ADDR}><SiChainlink className="text-blue-500" /> <span className="text-sm">Chainlink (LINK)</span></SelectItem>

</>);

    case ARBITRUM_SEPOLIA_CHAINID:
      return (  <>
     <SelectItem className="flex text-white focus:bg-neutral-800 focus:text-white hover:bg-neutral-900 items-center gap-2 p-1" value={ARBITRUM_SEPOLIA_LINK_ADDR}><SiChainlink className="text-blue-500" /> <span className="text-sm">Chainlink (LINK)</span></SelectItem>
    </>);

    case BASE_SEPOLIA_CHAINID:
      return (
  <>
    <SelectItem className="flex text-white items-center focus:bg-neutral-800 hover:bg-neutral-900 focus:text-white gap-2 p-1"  value={BASE_SEPOLIA_WETH_ADDR}> <FaEthereum className="text-zinc-500"/> <span className="text-sm">Wrapped Ethereum (WETH)</span></SelectItem>
     <SelectItem className="flex text-white items-center focus:bg-neutral-800 hover:bg-neutral-900 focus:text-white gap-2 p-1"  value={BASE_SEPOLIA_LINK_ADDR}><SiChainlink className="text-blue-500" />  <span className="text-sm">Chainlink (LINK)</span></SelectItem>
    </>

      );

    default:
      return (<></>)
    
  }


}

const borrowPolishStableCoin= (amount:number, collateralAddress:ethereumAddress)=>{
  try{
writeContract({
    abi:vaultManagerAbi,
    address: currentChainVaultManagerAddress as `0x${string}`,
    functionName:'mintPLST',
    args:[collateralAddress, amount * 1e18],
    chainId
});



sendToastContent({toastText:'Borrowing PLST...',
    icon:'⏳'
});

  }catch(err){
console.log(err);
sendToastContent({toastText:'Something went wrong',
icon:'❌',
type:'error'
});
  
}
}

const handleBorrowStabilski:SubmitHandler<z.infer<typeof borrowPlstType>>=async(value)=>{
try {
  borrowPolishStableCoin(value.amount, value.collateralAddress as ethereumAddress);
} catch (error) {
  console.log(error);
  sendToastContent({'toastText':'Error occured while borrowing', 'type':'error'})
}
}


  return (
      <TabsContent value="borrow" className="flex flex-col gap-4 max-w-7xl w-full">
      
      <form onSubmit={handleSubmit(handleBorrowStabilski,(error)=>{
        console.log('errors', error);
      })} className='w-full max-w-xl self-center flex flex-col gap-3'>
<Card className=" w-full max-w-xl bg-neutral-800 self-center shadow-sm border-red-500 border shadow-black h-96">
  <div className="h-1/2 py-1 px-3 border-b border-red-500 flex gap-2 flex-col">
  <Label className="text-lg text-red-500">You Borrow</Label>
<div className="flex items-center gap-4">
  <Input 
  {...register('amount')}
  value={watch('amount')}
  onPaste={handlePaste} 
  onKeyDown={handleKeyDown} 
  onBlur={(e)=>{handleBlur(e.target.value, (amount)=>setValue('amount', amount))}}
  onChange={(e)=>handleChange(e, (amount)=>setValue('amount', amount))}type="number" step={0.01} min={0} max={maximumAmount} className="w-full text-white"/>
 <Select 
  {...register('collateralAddress')}
 onValueChange={(value)=>{
 setValue('collateralAddress', value as `0x${string}`);
 if(maxBorrowableData){
   const selectedContractNumber=Number(maxBorrowableData[arrayOfContracts.findIndex(contract => contract.address === value)].result as bigint / BigInt(1e18));

const maxAmount = selectedContractNumber;
   setMaximumAmount(maxAmount);
 }

 }}>
  <SelectTrigger className="w-44 text-white">
    <SelectValue placeholder="Vaults" />
  </SelectTrigger>
  <SelectContent className="w-64 relative border-red-500 flex flex-col gap-3 bg-neutral-800 p-1 shadow-sm shadow-black rounded-lg">
<TokensOptions/>
  </SelectContent>
</Select>
</div>
  </div>
    <div className="h-1/2 py-1 px-3 items-center flex gap-3 flex-col">
 <p 
 className="text-red-500 text-2xl font-semibold tracking">Your can still borrow</p>
<p className='text-white flex items-center gap-2'>{maxBorrowableData as unknown as singleResultType<bigint>
 && vaultContractInfo as unknown as singleResultType<bigint>[]
&& watch('collateralAddress') && arrayOfContracts.find((contract) => contract.address === watch('collateralAddress')) || arrayOfContracts.findIndex((contract) => contract.address === watch('collateralAddress')) !== -1   ?  (((Number((maxBorrowableData as unknown as 
singleResultType<bigint>[]
)[arrayOfContracts.findIndex((contract) => contract.address === watch('collateralAddress'))].result)) - (watch('amount') * (watch('collateralAddress') === SEPOLIA_ETH_WBTC_ADDR ? 1e8 : 1e18))) /  1e18).toFixed(2) : 0 } <span className='text-red-500'>PLST</span></p>

  </div>
  {errors.amount && <p className='text-sm text-red-500'>{errors.amount.message}</p>}
  {errors.collateralAddress && <p className='text-sm text-red-500'>{errors.collateralAddress.message}</p>}
</Card>

<Button type='submit'
className="p-6 transition-all shadow-sm shadow-black hover:bg-red-600 cursor-pointer hover:scale-95 text-lg max-w-sm self-center w-full bg-red-500">Borrow Stabilski (PLST)</Button>
      </form>


<OnChainDataContainer/>



  </TabsContent>
  )
}


export default BorrowTab

