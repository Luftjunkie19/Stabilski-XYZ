'use client';
import React, { useCallback, useMemo, useState } from 'react'
import { TabsContent } from '../ui/tabs'
import { Label } from '../ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select'
import { FaEthereum, FaBitcoin } from 'react-icons/fa6'
import { SiChainlink } from 'react-icons/si'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { useAccount, useReadContract, useReadContracts, useSwitchChain, useWatchContractEvent, useWriteContract } from 'wagmi'
import { usdplnOracleABI } from '@/lib/smart-contracts-abi/USDPLNOracle';
import { ARBITRUM_SEPOLIA_ABI, ARBITRUM_SEPOLIA_CHAINID, ARBITRUM_SEPOLIA_LINK_ADDR, BASE_SEPOLIA_CHAINID, BASE_SEPOLIA_LINK_ABI, BASE_SEPOLIA_LINK_ADDR, BASE_SEPOLIA_WETH_ABI, BASE_SEPOLIA_WETH_ADDR, SEPOLIA_ETH_CHAINID, SEPOLIA_ETH_LINK_ABI, SEPOLIA_ETH_LINK_ADDR, SEPOLIA_ETH_WBTC_ABI, SEPOLIA_ETH_WBTC_ADDR, SEPOLIA_ETH_WETH_ABI, SEPOLIA_ETH_WETH_ADDR } from '@/lib/CollateralContractAddresses';
import { vaultManagerAbi } from '@/lib/smart-contracts-abi/VaultManager';
import { stabilskiTokenArbitrumSepoliaCollateralManagerAddress, stabilskiTokenBaseSepoliaCollateralManagerAddress, stabilskiTokenCollateralManagerAbi, stabilskiTokenSepoliaEthCollateralManagerAddress } from '@/lib/smart-contracts-abi/CollateralManager';
import OnChainDataContainer from '../chain-data/OnChainDataContainer';
import useBlockchainData from '@/lib/hooks/useBlockchainData';
import { CollateralDeposited, ethereumAddress, EventType } from '@/lib/types/onChainData/OnChainDataTypes';
import usePreventInvalidInput from '@/lib/hooks/usePreventInvalidInput';
import useToastContent from '@/lib/hooks/useToastContent';
import * as z from 'zod';

import {useForm, SubmitHandler} from "react-hook-form";

function ColltateralTab() {
    useSwitchChain({mutation:{
      onSuccess:(data)=>{
        console.log(data);
        setMaximumAmount(0);
        reset();
        setApproved(false);
      }
    }});

  const {handlePaste, handleKeyDown, handleBlur, handleChange}=usePreventInvalidInput();
  const [maximumAmount, setMaximumAmount] = useState<number>(0);
  const [approved, setApproved] = useState<boolean>(false);
    const depositCollateral = z.object({
    amount: z.number().gt(0, {'error':'The amount deposited must be greater than 0'}).max(maximumAmount, {error:'Deposited amount cannot surpass '}),
    depositCollateralAddress: z.string().startsWith('0x', {message:"The selected token address hasn't been "}).length(42, {'message':'You selected invalid collateral token.'})
  });

  const {register, handleSubmit, watch, clearErrors,reset, setValue, formState }=useForm<z.infer<typeof depositCollateral>>({'mode':'all'});

  const {errors}=formState;

    const {chainId, address}=useAccount();

    const {writeContract}=useWriteContract();

    const { sendToastContent}=useToastContent();

    const {getTokenAbi, currentChainVaultManagerAddress, currentOraclePriceAddress, currentBlockchainScanner}=useBlockchainData();


    const currentAbi = getTokenAbi(watch('depositCollateralAddress') as `0x${string}`);

    const currentTokenArgs= watch('depositCollateralAddress') === BASE_SEPOLIA_WETH_ADDR || watch('depositCollateralAddress') === SEPOLIA_ETH_WETH_ADDR ? 
     {
    src:address,
    guy: currentChainVaultManagerAddress
  }
  :
  {
    owner:address,
    spender: currentChainVaultManagerAddress,
  }

    const arrayOfContracts=useMemo(()=>{
     return [
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
                abi:ARBITRUM_SEPOLIA_ABI,
                address:ARBITRUM_SEPOLIA_LINK_ADDR,
                functionName:'balanceOf',
                args:[address],
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
    }, [address]);
    

    const {data}=useReadContracts({contracts:[
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
  
    ]});


    const {data:collateralTokenPriceData}=useReadContracts({contracts:[
   {
         'abi':stabilskiTokenCollateralManagerAbi,
        'address':stabilskiTokenSepoliaEthCollateralManagerAddress,
        'functionName':'getTokenPrice',
        'args':[SEPOLIA_ETH_WBTC_ADDR],
        chainId:SEPOLIA_ETH_CHAINID
    },
        {
         'abi':stabilskiTokenCollateralManagerAbi,
        'address':stabilskiTokenSepoliaEthCollateralManagerAddress,
        'functionName':'getTokenPrice',
        'args':[SEPOLIA_ETH_WETH_ADDR],
        chainId:SEPOLIA_ETH_CHAINID
    },
        {
         'abi':stabilskiTokenCollateralManagerAbi,
        'address':stabilskiTokenSepoliaEthCollateralManagerAddress,
        'functionName':'getTokenPrice',
        'args':[SEPOLIA_ETH_LINK_ADDR],
        chainId:SEPOLIA_ETH_CHAINID
    },
        {
              abi:stabilskiTokenCollateralManagerAbi,
              address:stabilskiTokenArbitrumSepoliaCollateralManagerAddress,
              functionName:'getTokenPrice',
              args:[ARBITRUM_SEPOLIA_LINK_ADDR],
              chainId:ARBITRUM_SEPOLIA_CHAINID
            },
      {
        abi:stabilskiTokenCollateralManagerAbi,
              address:stabilskiTokenBaseSepoliaCollateralManagerAddress,
              functionName:'getTokenPrice',
              args:[BASE_SEPOLIA_LINK_ADDR],
              chainId:BASE_SEPOLIA_CHAINID
      },
            {
        abi:stabilskiTokenCollateralManagerAbi,
              address:stabilskiTokenBaseSepoliaCollateralManagerAddress,
              functionName:'getTokenPrice',
              args:[BASE_SEPOLIA_WETH_ADDR],
              chainId:BASE_SEPOLIA_CHAINID
      }
    ]});
    
    const {data:collateralData}=useReadContracts({contracts:[
   {
         'abi':stabilskiTokenCollateralManagerAbi,
        'address':stabilskiTokenSepoliaEthCollateralManagerAddress,
        'functionName':'getCollateralInfo',
        'args':[SEPOLIA_ETH_WBTC_ADDR],
        chainId:SEPOLIA_ETH_CHAINID
    },
        {
         'abi':stabilskiTokenCollateralManagerAbi,
        'address':stabilskiTokenSepoliaEthCollateralManagerAddress,
        'functionName':'getCollateralInfo',
        'args':[SEPOLIA_ETH_WETH_ADDR],
        chainId:SEPOLIA_ETH_CHAINID
    },
        {
         'abi':stabilskiTokenCollateralManagerAbi,
        'address':stabilskiTokenSepoliaEthCollateralManagerAddress,
        'functionName':'getCollateralInfo',
        'args':[SEPOLIA_ETH_LINK_ADDR],
        chainId:SEPOLIA_ETH_CHAINID
    },
    {
              abi:stabilskiTokenCollateralManagerAbi,
              address:stabilskiTokenArbitrumSepoliaCollateralManagerAddress,
              functionName:'getCollateralInfo',
              args:[address, ARBITRUM_SEPOLIA_LINK_ADDR],
              chainId:ARBITRUM_SEPOLIA_CHAINID
    },
       {
              abi:stabilskiTokenCollateralManagerAbi,
              address:stabilskiTokenArbitrumSepoliaCollateralManagerAddress,
              functionName:'getCollateralInfo',
              args:[address, BASE_SEPOLIA_LINK_ADDR],
              chainId:BASE_SEPOLIA_CHAINID
    },
     {
              abi:stabilskiTokenCollateralManagerAbi,
              address:stabilskiTokenArbitrumSepoliaCollateralManagerAddress,
              functionName:'getCollateralInfo',
              args:[address, BASE_SEPOLIA_WETH_ADDR],
              chainId:BASE_SEPOLIA_CHAINID
    }
    ]});


    const {data:usdplnOraclePrice}=useReadContract({
         'abi': usdplnOracleABI,
        'address':currentOraclePriceAddress as ethereumAddress,
        'functionName':'getPLNPrice',
        'args':[],
        chainId
    });


    const getTheMaxAmountOfTokensToBorrowBasedOnAmountAndToken= useCallback(()=>{
      if(!collateralTokenPriceData || !usdplnOraclePrice || !watch('depositCollateralAddress') || !collateralData) return 0;

      if(collateralData && collateralTokenPriceData && usdplnOraclePrice && watch('depositCollateralAddress')){
        
        const convertedNumber= Number(collateralTokenPriceData[arrayOfContracts.findIndex(c => c.address === watch('depositCollateralAddress'))].result);
        
        const selectedCollateralTokenInfo = collateralData[arrayOfContracts.findIndex((val)=>val.address === watch('depositCollateralAddress'))].result;

        console.log(selectedCollateralTokenInfo);


        const main =((watch('amount') * convertedNumber) * Number(usdplnOraclePrice) * 1e18) / 1e22;
        
        const maxToBorrow = (main / 1e18);
        return (maxToBorrow / 1.4);
}

return 0;

},[collateralTokenPriceData, usdplnOraclePrice, watch('depositCollateralAddress'), collateralData, arrayOfContracts, watch('amount')]);


const TokensOptions = ()=>{
 switch(chainId){
    case SEPOLIA_ETH_CHAINID:
      return(<>
 
        <SelectItem className="flex bg-neutral-800 focus:bg-neutral-900 items-center gap-2 p-1" value={SEPOLIA_ETH_WETH_ADDR}> <FaEthereum className="text-zinc-500"/> <span className="text-sm text-white">Wrapped Ethereum (WETH)</span></SelectItem>
    <SelectItem className="flex bg-neutral-800 focus:bg-neutral-900 items-center gap-2 p-1"  value={SEPOLIA_ETH_WBTC_ADDR}><FaBitcoin className="text-orange-500"/> <span className="text-sm text-white">Wrapped Bitcoin (WBTC)</span></SelectItem>
    <SelectItem className="flex bg-neutral-800 focus:bg-neutral-900 items-center gap-2 p-1"  value={SEPOLIA_ETH_LINK_ADDR}><SiChainlink className="text-blue-500" /> <span className="text-sm text-white">Chainlink (LINK)</span></SelectItem>

</>);

    case ARBITRUM_SEPOLIA_CHAINID:
      return (  <>
     <SelectItem className="flex bg-neutral-800 focus:bg-neutral-900 items-center gap-2 p-1" value={ARBITRUM_SEPOLIA_LINK_ADDR}><SiChainlink className="text-blue-500" /> <span className="text-sm text-white">Chainlink (LINK)</span></SelectItem>
    </>);

    case BASE_SEPOLIA_CHAINID:
      return (
  <>
    <SelectItem className="flex bg-neutral-800 focus:bg-neutral-900 items-center gap-2 p-1"  value={BASE_SEPOLIA_WETH_ADDR}> <FaEthereum className="text-zinc-500"/> <span className="text-sm text-white">Wrapped Ethereum (WETH)</span></SelectItem>
     <SelectItem className="flex bg-neutral-800 focus:bg-neutral-900 items-center gap-2 p-1"  value={BASE_SEPOLIA_LINK_ADDR}><SiChainlink className="text-blue-500" />  <span className="text-sm text-white">Chainlink (LINK)</span></SelectItem>
    </>

      );

    default:
      return (<></>)
    
  }


}

const CollateralTokensBalance=()=>{
switch(chainId){
case SEPOLIA_ETH_CHAINID:
  return (<>
  {data && 
<div className="flex flex-col gap-1 px-4">
  <div className="w-full flex sm:items-center flex-row  gap-3">
<div className='flex items-center gap-1 text-white'>
  <FaBitcoin className='text-orange-500'/> {(data[0] && Number(data[0].result) / 1e8).toFixed(2)}
</div>
<div className='flex items-center gap-1 text-white'><FaEthereum className='text-zinc-500'/> {(data[1] && Number(data[1].result) / 1e18).toFixed(2)}</div>
<div className='flex items-center gap-1 text-white'><SiChainlink className='text-blue-500'/> {data[2] && (Number(data[2].result) / 1e18).toFixed(2)}</div>
</div>
</div>}
  </>)

case ARBITRUM_SEPOLIA_CHAINID:
  return(<>{
    data && 
<div className="flex flex-col gap-1 px-4">
<div className='flex items-center gap-1 text-white'><SiChainlink className='text-blue-500'/> {data[3] && (Number(data[3].result) / 1e18).toFixed(2)}</div>
</div>
  }
  </>)
 
 case BASE_SEPOLIA_CHAINID:
  return (<>{data && <div className="flex items-center gap-2 px-4">
    <div className='flex items-center gap-1 text-white'><SiChainlink className='text-blue-500'/> {data[4] && (Number(data[4].result) / 1e18).toFixed(2)}</div>
        <div className='flex items-center gap-1 text-white'><FaEthereum className='text-blue-800'/> {data[5] && (Number(data[5].result) / 1e18).toFixed(2)}</div>
    </div>}</>)

}

}



useWatchContractEvent({
    address: watch('depositCollateralAddress') as ethereumAddress,
    abi: currentAbi,
    eventName: 'Approval',
  'onLogs':(logs)=>{
    console.log('New logs!', logs);
    setApproved(true);
    sendToastContent({toastText:'Stabilski Tokens Approved Successfully',
    icon:'✅',
    type:'success'
  });
  },
  enabled: typeof watch('depositCollateralAddress') === 'string' && watch('depositCollateralAddress').length === 42,
  args:currentTokenArgs
  });

  useWatchContractEvent({
    address: currentChainVaultManagerAddress as `0x${string}`,
    abi: vaultManagerAbi,
    eventName: 'CollateralDeposited',
  'onLogs':(logs)=>{
    const eventLog= logs[0] as EventType<CollateralDeposited>;
    sendToastContent({toastText:`Collateral successfully deposited ${
 ( Number(
 eventLog.args?.amount
  ) / (eventLog.args?.token !== SEPOLIA_ETH_WBTC_ADDR ? 1e18 : 1e8)).toFixed(4)} ${eventLog.args?.token === SEPOLIA_ETH_WBTC_ADDR ? 'WBTC' : eventLog.args?.token === SEPOLIA_ETH_WETH_ADDR ? 'WETH' : eventLog.args?.token === SEPOLIA_ETH_LINK_ADDR ? 'LINK' : eventLog.args?.token === BASE_SEPOLIA_WETH_ADDR ? 'WETH' : 'LINK'  
  }`, 
  'icon':'✅',
    type:'success'
  });
  setApproved(false);
  reset();
  setMaximumAmount(0);
  },
  args:{
    vaultOwner: address,
    token: watch('depositCollateralAddress'),
  },
  'enabled': watch('amount') > 0 && watch('depositCollateralAddress') !== undefined && address !== undefined && chainId !== undefined,
  });

  const internalizedMaxBorrowable= useMemo(()=>{

    const maxAmountValue = getTheMaxAmountOfTokensToBorrowBasedOnAmountAndToken();
    if(maxAmountValue === 0) return '0.00 zł';

    const returnValue =  new Intl.NumberFormat('pl-PL',{
    'style':'currency',
    'currency':'PLN',
    maximumFractionDigits:6,
    minimumFractionDigits:2
  }).format(getTheMaxAmountOfTokensToBorrowBasedOnAmountAndToken());

    return returnValue;
    
  },[getTheMaxAmountOfTokensToBorrowBasedOnAmountAndToken]);



  const collaterlizePosition=()=>{
try {
  writeContract({
    'abi':vaultManagerAbi,
    'address':currentChainVaultManagerAddress as ethereumAddress,
    'functionName':'depositCollateral',
    'args':[watch('depositCollateralAddress')],
  });

 
  sendToastContent({
    toastText:'Depositing Collateral...',
    icon:'⏳'
  });


} catch (error) {
  sendToastContent({toastText:`Error depositing collateral: ${(error as Error).message}`,
  icon:'❌',
  type:'error'
});
}
}

const approveCollateral=()=>{
  try {
if(watch('depositCollateralAddress')){
  console.log(arrayOfContracts.find(contract => contract.address === watch('depositCollateralAddress')));
     writeContract({
    'abi':arrayOfContracts.find(contract => contract.address === watch('depositCollateralAddress'))!.abi,
    'address':arrayOfContracts.find(contract => contract.address === watch('depositCollateralAddress'))!.address as ethereumAddress,
    'functionName':'approve',
    'args':[currentChainVaultManagerAddress, watch('amount') * 1e18],
  }, {
    onError(error) {
        sendToastContent({toastText:`Error approving collateral:${error.message}`,
        icon:'❌',
        type:'error'
      });
    },
    onSuccess(data) {
      console.log('Success', data);
  
        sendToastContent({toastText:`Depositing Collateral...`,
        icon:'⏳',
        type:'info'
      });
    },
   
  })
}    
  } catch (error) {
    sendToastContent({toastText:`Error approving collateral: ${(error as Error).message}`,
    icon:'❌',
    type:'error'
  });   
  }

}



const handleSubmitApproval:SubmitHandler<z.infer<typeof depositCollateral>> = async ()=>{
try{
  if(approved){
    collaterlizePosition();
    return;
  }
  approveCollateral();
}catch(err){
  sendToastContent({'toastText':'Something went wrong', 'type':'error'})
}

}



  return (
    <TabsContent value="collateral" className="max-w-7xl w-full">

<form onSubmit={handleSubmit(handleSubmitApproval,(error)=>{
 console.log(error); 
})} className='w-full flex flex-col gap-4'>
<Card className=" w-full max-w-lg bg-neutral-800 self-center shadow-sm border-red-500 border shadow-black h-96">
  
  <div className="h-1/2 py-1 px-3 border-b border-red-500 flex gap-3 flex-col">
  <Label className="text-xl text-white">You Give</Label>
<div className="flex items-center gap-4 text-white">
  <Input {...register('amount')} step={0.000001}  value={watch('amount')} inputMode='decimal' 
   onPaste={handlePaste} 
  onKeyDown={handleKeyDown} 
  onBlur={(e)=>{handleBlur(e.target.value, (collateralAmount)=>{setValue('amount', collateralAmount)})}}
  onChange={(e)=>handleChange(e, (collateralAmount)=>{setValue('amount', collateralAmount)})} type="number" min={0} 
  max={maximumAmount}  className="w-full"/>
 <Select  {...register('depositCollateralAddress')}  value={watch('depositCollateralAddress')} onValueChange={(value) => {
setValue('depositCollateralAddress', value as `0x${string}`);
if(data && data[arrayOfContracts.findIndex(contract => contract.address === value)].result){

  const maxCollateral= Number(data[arrayOfContracts.findIndex(contract => contract.address === value)].result) / (value === SEPOLIA_ETH_WBTC_ADDR ? 1e8 : 1e18);
  console.log(maxCollateral, 'maxCollateral');
  setMaximumAmount(maxCollateral);
}
}}>
  <SelectTrigger className="w-44">
    <SelectValue className='border-red-500'  placeholder="Token" />
  </SelectTrigger>
  <SelectContent className="w-64 border-red-500 relative flex flex-col gap-3 bg-neutral-800 shadow-sm shadow-black rounded-lg">
<TokensOptions/>
  </SelectContent>
</Select>
</div>
  
  {errors.amount?.message && <p className='text-sm text-red-500'>{errors.amount?.message}</p>}
  {errors.depositCollateralAddress?.message &&  <p className='text-sm text-red-500'>{errors.depositCollateralAddress?.message}</p>}
  </div>

    <div className="h-1/2 py-1 px-3 flex gap-3 flex-col w-full">
  <Label className="text-lg text-white">You Will Be Able To Borrow (Max.)</Label>
<div className="flex w-full items-center gap-2">
  <div className="p-2 w-full rounded-lg border-gray-300 border">
  <p className='text-red-500'>{internalizedMaxBorrowable}</p>
</div>
</div>
  </div>

<CollateralTokensBalance/>
</Card>

<div className="flex flex-wrap w-full gap-2 justify-center">
<Button disabled={approved} type='submit' className="p-6 cursor-pointer transition-all shadow-sm shadow-black hover:bg-blue-900 hover:scale-95 text-lg max-w-64 self-center w-full bg-blue-500">Approve Collateral</Button>
  
<Button type='submit' disabled={!approved} className="p-6 transition-all shadow-sm shadow-black hover:bg-red-600 cursor-pointer hover:scale-95 text-lg max-w-64 self-center w-full bg-red-500">Put Collateral</Button>
</div>

<OnChainDataContainer/>
</form>



  </TabsContent>
  )
}

export default ColltateralTab