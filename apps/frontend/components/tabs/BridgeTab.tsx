'use client';

import React, {useMemo, useState } from 'react'

import { Card } from "./../ui/card"
import { TabsContent } from './../ui/tabs'
import { Label } from './../ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './../ui/select'
import { Button } from './../ui/button'
import { Input } from './../ui/input'
import Image from 'next/image';
import arbitrumLogo from "@/public/arbitrum-logo.png";
import baseLogo from "@/public/base-logo.png";
import { FaEthereum } from 'react-icons/fa6';
import { useAccount, useAccountEffect, useBalance, useReadContract, useWatchContractEvent, useWriteContract } from 'wagmi';
import { stabilskiTokenABI } from '@/lib/smart-contracts-abi/StabilskiToken';
import { ARBITRUM_SEPOLIA_CHAINID, BASE_SEPOLIA_CHAINID, SEPOLIA_ETH_CHAINID } from '@/lib/CollateralContractAddresses';
import { routerAbi } from '@/lib/smart-contracts-abi/ccip/Router';
import { config } from '@/lib/Web3Provider';
import { readContract } from '@wagmi/core'
import { ccipInformationRetrieverAbi, stabilskiTokenPoolAbi } from '@/lib/smart-contracts-abi/ccip/StabilskiTokenCCIPNeededData';
import useBlockchainData from '@/lib/hooks/useBlockchainData';
import { ApprovalInterface, BurnedInterface, ethereumAddress, EventType } from '@/lib/types/onChainData/OnChainDataTypes';
import Link from 'next/link';
import usePreventInvalidInput from '@/lib/hooks/usePreventInvalidInput';
import useToastContent from '@/lib/hooks/useToastContent';
import { Skeleton } from '../ui/skeleton';
import PriceSkeleton from '../skeletons/PriceSkeleton';



function BridgeTab() {
const chainSelectorArbitrumSepolia = BigInt('3478487238524512106');
const chainSelectorSepoliaEth = BigInt('16015286601757825753');
const chainSelectorBaseSepolia= BigInt('10344971235874465080');
const {handleKeyDown, handlePaste, handleBlur, handleChange}=usePreventInvalidInput();
const {chainId, address}=useAccount();
const {data:dataBalance} =useBalance({address,'query':{
  enabled:address !== undefined || address !== null
}});
const [tokenAmountToSend, setTokenAmountToSend] = useState<number>(0);
const [destinationChainSelector, setDestinationChainSelector]=useState<string>();
const [approved, setApproved]=useState<boolean>(false);

const [sourceChainTx, setSourceChainTx]=useState<ethereumAddress>();
const [destinationPoolAddress, setDestinationPoolAddress]=useState<ethereumAddress>();
const {currentStabilskiContractAddress, getCurrentRouter, getCurrentCcipRetriever, getCurrentPoolAddress, getPoolAddressByChainSelector, currentBlockchainScanner}=useBlockchainData();

const {data, isLoading, isError}=useReadContract({
    abi:stabilskiTokenABI,
    address: currentStabilskiContractAddress as `0x${string}`,
    functionName: 'balanceOf',
    args: [address],
    chainId: chainId
});



const maxAmountToBeTransferred= useMemo(()=>{
  return Number(data ?? 0) / 1e18;
},[data])

 

const {writeContract, writeContractAsync}=useWriteContract();
const {sendToastContent}=useToastContent();

const currentRouter= getCurrentRouter();
const currentRetriever = getCurrentCcipRetriever();
const currentPoolAddr= getCurrentPoolAddress();




const {data:feeData, isLoading:isFeeDataLoading, isError:isFeeDataError, error}=useReadContract({
   abi:ccipInformationRetrieverAbi,
    address: currentRetriever as `0x${string}`,
    functionName:"getCcipTotalFees",
    args:[address,  BigInt(tokenAmountToSend * 1e18), destinationChainSelector],
    'query':{
      enabled: address !== undefined && destinationChainSelector !== undefined && tokenAmountToSend > 0,
      'subscribed':true
    }
});



const amountToBeTransfered = useMemo(()=>{
return (Number(data ?? 0) / 1e18) - tokenAmountToSend;
},[data, tokenAmountToSend])

const approveStabilskiTokens = async () => {
try {

if(!currentRouter){
  sendToastContent({toastText:"No router, no party !",
  icon:'❌',
  type:'error'
});
  return;
}

if(!destinationChainSelector){
  sendToastContent({toastText:"Destination Chain Has Not been selected",
  icon:'❌',
  type:'error'
});
  return;
}

if(tokenAmountToSend <= 0 || tokenAmountToSend > maxAmountToBeTransferred || BigInt(tokenAmountToSend* 1e18) > BigInt(1e24)){
  sendToastContent({toastText:'Impossible amount to be transfered...',
  icon:'❌',
  type:'error'
});
  return;
}

const turnedTokenAmountToSend= BigInt(tokenAmountToSend * 1e18);

writeContract({
  abi:stabilskiTokenABI,
    address: currentStabilskiContractAddress as `0x${string}`,
    functionName:"approve",
    args:[currentRetriever, turnedTokenAmountToSend],
    chainId
},{onSuccess(data, variables, onMutateResult, context) {
    sendToastContent({toastText:"Approval in precedure...",
  type:'info'
});
},
onError(error, variables, onMutateResult, context) {
    sendToastContent({toastText:"Approval failed",
  type:'error',
  icon:"⛔"
});
},
});





} catch (error) {
  console.log(error);
  sendToastContent({toastText:"Could not retrieve fees",
  icon:'❌',
  type:'error'
});
}
}

const commitCCIPTransfer= async ()=>{

  if(!destinationChainSelector){
    sendToastContent({toastText:`You haven't selected the destination chain.`,
    icon:'❌',
    type:'error'
  });
    return;
  }

  const totalFees = (feeData as unknown as bigint[])[0]  + (feeData as unknown as bigint[])[1];

  
  console.log(dataBalance);

  if(dataBalance && totalFees > dataBalance.value){
    sendToastContent({toastText:`You have not enough ETH to pay the fees.`,
    icon:'❌',
    type:'error'
  });
    return;
  }


  const destPoolAddr = getPoolAddressByChainSelector(String(destinationChainSelector));

  setDestinationPoolAddress(destPoolAddr);

const allowanceStabilskiToken= await readContract(config, {
    abi:stabilskiTokenABI,
    address: currentStabilskiContractAddress as ethereumAddress,
    functionName:"allowance",
    args:[address, currentRetriever]
});

  const txData = await writeContractAsync({
    abi:ccipInformationRetrieverAbi,
    address: currentRetriever as `0x${string}`,
    functionName:"sendCcipMessage",
    args:[address,BigInt(allowanceStabilskiToken as unknown as bigint), destinationChainSelector],
    chainId,
    value: totalFees as bigint
  }, {
    onError:()=>{
         sendToastContent({toastText:`An error occured to commit Cross-Chain Transfer   .`,
    icon:'❌',
    type:'error'
  });
    }
  });


  sendToastContent({toastText:'Depositing Collateral, Please Wait...',
    Link: <Link target='_blank' href={`${currentBlockchainScanner}/tx/${txData}`} className='font-semibold underline'>See your tx</Link>,
    icon:'⏳'
  });

  setSourceChainTx(txData);
}

const SelectOptions= ()=>{
  switch(chainId){
    case SEPOLIA_ETH_CHAINID:
      return(<>
        <SelectItem className='text-xs focus:bg-neutral-900 focus:text-white text-white flex items-center gap-2' value={`${chainSelectorArbitrumSepolia}`}>
          <Image src={arbitrumLogo} className='w-5 h-5' width={20} height={20} alt='logo'/>
    <span>
        Arbitrum Sepolia (ARB)
    </span>
    </SelectItem>
         <SelectItem className='text-xs focus:bg-neutral-900 focus:text-white text-white flex items-center gap-2' value={`${chainSelectorBaseSepolia}`}>
          <Image src={baseLogo} className='w-5 h-5' width={20} height={20} alt='logo'/>
    <span>
        Base Sepolia (BASE)
    </span>
    </SelectItem>
</>);

    case ARBITRUM_SEPOLIA_CHAINID:
      return (<>
      <SelectItem className='text-xs text-white focus:bg-neutral-900 focus:text-white' value={`${chainSelectorSepoliaEth}`}><FaEthereum className="text-gray-500"/>  Ethereum Sepolia (ETH)</SelectItem>
            <SelectItem className='text-xs text-white focus:bg-neutral-900 focus:text-white flex items-center gap-2' value={`${chainSelectorBaseSepolia}`}>
          <Image src={baseLogo} className='w-5 h-5' width={20} height={20} alt='logo'/>
    <span>
        Base Sepolia (BASE)
    </span>
    </SelectItem>
      </>);

    case BASE_SEPOLIA_CHAINID:
      return (<>
      <SelectItem className='text-xs text-white focus:bg-neutral-900 focus:text-white' value={`${chainSelectorSepoliaEth}`}><FaEthereum className="text-gray-500"/>  Ethereum Sepolia (ETH)</SelectItem>

       <SelectItem className='text-xs focus:bg-neutral-900 focus:text-white text-white flex items-center gap-2' value={`${chainSelectorArbitrumSepolia}`}>
          <Image src={arbitrumLogo} className='w-5 h-5' width={20} height={20} alt='logo'/>
    <span>
        Arbitrum Sepolia (ARB)
    </span>
    </SelectItem>

      </>);

    default:
      return (<></>)
    
  }


}

   useWatchContractEvent({
    address: currentStabilskiContractAddress as ethereumAddress,
    abi: stabilskiTokenABI,
    eventName: 'Approval',
  'onLogs':(logs)=>{
    console.log('New logs!', logs[0] as EventType<ApprovalInterface>);
    setApproved(true);
    sendToastContent({toastText:`Stabilski Tokens Approved Successfully (${
     ( Number((logs[0] as EventType<ApprovalInterface>).args?.value) / 1e18).toFixed(3)
      }) PLST`,
    icon:'✅',
    type:'success'
  });
  },
  args:{
    owner: address,
  },
   'strict':true,
  });

  useWatchContractEvent({
    address: currentPoolAddr,
    abi: stabilskiTokenPoolAbi,
    'eventName':'Burned',
    args:{
      sender: address,
    },
   'onLogs':(logs)=>{
    sendToastContent({toastText:`Successful Transfer to Burner (Destination Chain) ${(Number((logs[0] as EventType<BurnedInterface>).args?.amount)/1e18).toFixed(2)}`,
    icon:'✅',
    type:'success'
  });
   },
   'strict':true,
  });

     useWatchContractEvent({
    address: destinationPoolAddress,
    abi: stabilskiTokenPoolAbi,
    'eventName':'Minted',
    args:{
      recipient: address,
      value: tokenAmountToSend && BigInt(tokenAmountToSend * 1e18)
    },
    enabled: tokenAmountToSend !== undefined, 
   'onLogs':(logs)=>{
    console.log(logs, 'Logs from Transfer');
    sendToastContent({toastText:'Successfuly Received PLST Tokens',
    icon:'✅',
    type:'success'
  }
);
    setApproved(false);
    setSourceChainTx(undefined);
    setTokenAmountToSend(0);
    setDestinationChainSelector(undefined);
   },
    'strict':true,
  
  });


  useAccountEffect({
    onDisconnect(){
      setApproved(false);
      setDestinationChainSelector(undefined);
      setDestinationPoolAddress(undefined);
      setSourceChainTx(undefined);
      setTokenAmountToSend(0);
    }
  });




  return (
  <TabsContent value="bridge" className="flex flex-col gap-4 max-w-xl w-full">
    

      <Card className=" w-full shadow-sm border-red-500 border bg-neutral-800 shadow-black ">
  <div className="pb-4 px-3 border-b border-red-500 flex gap-3 flex-col">
  <Label className="text-xl text-red-500">Root Chain PLST</Label>
<div className="flex items-center gap-4">
<div className="w-full flex-col gap-2">
  <Label className='text-white text-base'>Amount</Label>
    <Input 
    onBlur={(e)=>handleBlur(e.target.value, setTokenAmountToSend)}
       onPaste={handlePaste} 
  onKeyDown={handleKeyDown} 
    onChange={(e) => handleChange(e,setTokenAmountToSend)} type="number" step={0.001} min={0} max={maxAmountToBeTransferred} className="w-full text-white"/>
</div>

</div>

<div className="flex items-center gap-1">
    <p className='text-white'>Balance
      {(data as unknown as bigint) && <span className='text-white pl-1 font-bold'>{amountToBeTransfered.toFixed(4)}</span>} 
      </p>
      {isLoading  && <PriceSkeleton/>}
      {isError && <span className='text-sm text-red-500'>{"Error occured whilst fetching Balance"}</span> }
      {!isError &&
      <span className='text-red-500 font-bold'>PLST</span>
      }
  
</div>
  </div>
    <div className="h-1/2 w-full py-1 px-3 flex gap-3 flex-col">
  <Label className="text-base text-red-500">Destination Chain</Label>
   <Select
   onValueChange={(value)=>{
    setDestinationChainSelector(value);
   }}>
  <SelectTrigger className="w-full p-4  text-white border-red-500">
    <SelectValue placeholder="Token" />
  </SelectTrigger>
  <SelectContent className="bg-neutral-800 border-red-500 max-w-xl w-full shadow-sm shadow-black rounded-lg">
<SelectOptions/>
  </SelectContent>
</Select>
  </div>



     <div className="p-3 border-t border-red-500 flex flex-col w-full gap-2">
      <p className='text-lg font-bold text-red-500'>Fees Summary</p>
{isFeeDataError && <p className='text-red-500 text-sm font-semibold'>Error occured while loading fees.</p>}
{error && <p className='text-red-500 text-xs font-light'>{error.cause.message}</p>}
   
      <div className="w-full flex flex-col gap-2 justify-center items-center">
        {(isFeeDataLoading || (feeData as bigint[])) && <>
    <div className='flex text-white items-center gap-4 p-3 bg-neutral-700/20 rounded-md justify-between max-w-4/5 w-full'>
<p className='text-sm font-light'>Bridge Fee</p>
      {(isFeeDataLoading) && !feeData && <Skeleton className='bg-gray-500 w-24 h-6 rounded-sm'/>} 
      {!isFeeDataLoading && feeData as bigint[] && <span className='text-red-500 text-sm font-bold'>{(Number((feeData as bigint[])[0]) / 1e18).toFixed(6)} <span className='text-white pl-1'>ETH</span></span>}
    </div>

     <div className='flex text-white items-center gap-4 p-3 bg-neutral-700/20 rounded-md justify-between max-w-4/5 w-full'>
<p className='text-sm font-light'>Protocol Fee</p>
      {isFeeDataLoading && !feeData && <Skeleton className='bg-gray-500 w-24 h-6 rounded-sm'/>} 
      {!isFeeDataLoading && feeData as bigint[] && <span className='text-red-500 text-sm font-bold'>{(Number((feeData as bigint[])[1] ) / 1e18).toFixed(18)} <span className='text-white pl-1'>ETH</span></span>}
    </div>
        
        </>
        }
  

      </div>
    </div>

    </Card>

   <div className="flex flex-col sm:flex-row items-center w-full justify-center gap-3">
     <Button disabled={approved} onClick={approveStabilskiTokens} className="p-6  transition-all shadow-sm shadow-black hover:bg-red-600 cursor-pointer hover:scale-95 text-base md:text-lg max-w-64  sm:max-w-72 self-center w-full bg-red-500">Approve Tokens</Button>
      <Button disabled={!approved} onClick={commitCCIPTransfer} className={`p-6 disabled:bg-blue-400 disabled:opacity-95 transition-all shadow-sm shadow-black hover:bg-blue-600 cursor-pointer hover:scale-95 text-base md:text-lg max-w-64 sm:max-w-72 self-center w-full bg-blue-500`}>Bridge Tokens</Button>
   </div>

   {sourceChainTx &&
  <div className=''>
 <div
   className={`flex flex-col gap-2`}>
     <Link 
   target="_blank"
   href={`https://ccip.chain.link`} className="text-white hover:text-gray-600 transition-all underline ">Visit Tx-explorer</Link>
  
  <Button className='p-3 max-w-52 w-full cursor-pointer hover:bg-gray-800'
onClick={()=>{
navigator.clipboard.writeText(sourceChainTx);
sendToastContent({toastText:"Successfully copied tx-hash",
icon:'✅',
type:'success'
}); 
}}
>
  Copy Tx Hash
</Button>


   </div>


  </div>
   
   }

  </TabsContent>
  )

}

export default BridgeTab;