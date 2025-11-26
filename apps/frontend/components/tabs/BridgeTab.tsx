'use client';

import React, { useMemo, useState } from 'react'

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
import { useAccount, useReadContract, useWatchContractEvent, useWriteContract } from 'wagmi';
import { stabilskiTokenABI } from '@/lib/smart-contracts-abi/StabilskiToken';
import { ARBITRUM_SEPOLIA_CHAINID, BASE_SEPOLIA_CHAINID, SEPOLIA_ETH_CHAINID } from '@/lib/CollateralContractAddresses';
import { routerAbi } from '@/lib/smart-contracts-abi/ccip-routers/Router';
import { config } from '@/lib/Web3Provider';
import { readContract } from '@wagmi/core'

import { toast } from 'sonner';
import { ccipInformationRetrieverAbi, stabilskiTokenPoolAbi } from '@/lib/smart-contracts-abi/ccip-routers/StabilskiTokenCCIPNeededData';
import useBlockchainData from '@/lib/hooks/useBlockchainData';
import { ApprovalInterface, BurnedInterface, ethereumAddress, EventType } from '@/lib/types/onChainData/OnChainDataTypes';
import Link from 'next/link';

function BridgeTab() {
const chainSelectorArbitrumSepolia = BigInt('3478487238524512106');
const chainSelectorSepoliaEth = BigInt('16015286601757825753');
const chainSelectorBaseSepolia= BigInt('10344971235874465080');

const {chainId, address}=useAccount();
const [tokenAmountToSend, setTokenAmountToSend] = useState<number>(0);
const [destinationChainSelector, setDestinationChainSelector]=useState<string>();
const [approved, setApproved]=useState<boolean>(false);

  const [sourceChainTx, setSourceChainTx]=useState<ethereumAddress>();
  const [destinationPoolAddress, setDestinationPoolAddress]=useState<ethereumAddress>();

const {currentStabilskiContractAddress, getCurrentRouter, getCurrentCcipRetriever, getCurrentPoolAddress, getPoolAddressByChainSelector}=useBlockchainData();

const {data}=useReadContract({
    abi:stabilskiTokenABI,
    address: currentStabilskiContractAddress as `0x${string}`,
    functionName: 'balanceOf',
    args: [address],
    chainId: chainId
});

const {writeContract, writeContractAsync}=useWriteContract();

const currentRouter= getCurrentRouter();
const currentRetriever = getCurrentCcipRetriever();
const currentPoolAddr= getCurrentPoolAddress();

const amountToBeTransfered = useMemo(()=>{
return (Number(data ?? 0) / 1e18) - tokenAmountToSend;
},[tokenAmountToSend, data])

const approveStabilskiTokens = async () => {
try {

if(!currentRouter){
  toast.error("No router, no party !");
  return;
}

if(!destinationChainSelector){
  toast.error("Destination Chain Has Not been selected");
  return;
}

if(tokenAmountToSend === 0){
  toast.error('Amount to send cross-chain cannot be equal 0');
  return;
}

const turnedTokenAmountToSend= BigInt(tokenAmountToSend * 1e18);

writeContract({
  abi:stabilskiTokenABI,
    address: currentStabilskiContractAddress as `0x${string}`,
    functionName:"approve",
    args:[currentRouter, turnedTokenAmountToSend],
    chainId
});

} catch (error) {
  console.log(error);
  toast.error("Could not retrieve fees");
}
}

const commitCCIPTransfer= async ()=>{

  if(!destinationChainSelector){
    toast.error(`You haven't selected the destination chain.`);
    return;
  }


const allowanceStabilskiToken= await readContract(config, {
    abi:stabilskiTokenABI,
    address: currentStabilskiContractAddress as ethereumAddress,
    functionName:"allowance",
    args:[address, currentRouter]
});

  const getFee = await readContract(config, {
    abi:ccipInformationRetrieverAbi,
    address: currentRetriever as `0x${string}`,
    functionName:"getCCIPMessageFee",
    args:[address, allowanceStabilskiToken, destinationChainSelector]
  });

   const getCcipMessage = await readContract(config, {
    abi:ccipInformationRetrieverAbi,
    address: currentRetriever as `0x${string}`,
    functionName:"getCcipMessage",
    args:[address, allowanceStabilskiToken]
  });
  const destPoolAddr = getPoolAddressByChainSelector(destinationChainSelector);

  setDestinationPoolAddress(destPoolAddr);

  const txData = await writeContractAsync({
    abi:routerAbi,
    address: currentRouter as `0x${string}`,
    functionName:"ccipSend",
    args:[destinationChainSelector, getCcipMessage],
    chainId,
    value: getFee as bigint
  });

  setSourceChainTx(txData);
  setTokenAmountToSend(0);
}

const SelectOptions= ()=>{
  switch(chainId){
    case SEPOLIA_ETH_CHAINID:
      return(<>
        <SelectItem className='text-xs flex items-center gap-2' value={`${chainSelectorArbitrumSepolia}`}>
          <Image src={arbitrumLogo} className='w-5 h-5' width={20} height={20} alt='logo'/>
    <span>
        Arbitrum Sepolia (ARB)
    </span>
    </SelectItem>
         <SelectItem className='text-xs flex items-center gap-2' value={`${chainSelectorBaseSepolia}`}>
          <Image src={baseLogo} className='w-5 h-5' width={20} height={20} alt='logo'/>
    <span>
        Base Sepolia (BASE)
    </span>
    </SelectItem>
</>);

    case ARBITRUM_SEPOLIA_CHAINID:
      return (<>
      <SelectItem className='text-xs' value={`${chainSelectorSepoliaEth}`}><FaEthereum className="text-gray-500"/>  Ethereum Sepolia (ETH)</SelectItem>
            <SelectItem className='text-xs flex items-center gap-2' value={`${chainSelectorBaseSepolia}`}>
          <Image src={baseLogo} className='w-5 h-5' width={20} height={20} alt='logo'/>
    <span>
        Base Sepolia (BASE)
    </span>
    </SelectItem>
      </>);

    case BASE_SEPOLIA_CHAINID:
      return (<>
      <SelectItem className='text-xs' value={`${chainSelectorSepoliaEth}`}><FaEthereum className="text-gray-500"/>  Ethereum Sepolia (ETH)</SelectItem>

       <SelectItem className='text-xs flex items-center gap-2' value={`${chainSelectorArbitrumSepolia}`}>
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
    toast.success(`Stabilski Tokens Approved Successfully (${
     ( Number((logs[0] as EventType<ApprovalInterface>).args?.value) / 1e18).toFixed(3)
      }) PLST`);
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
    toast.success(`Successful Transfer to Burner (Destination Chain) ${(Number((logs[0] as EventType<BurnedInterface>).args?.amount)/1e18).toFixed(2)}`);
   },
   'strict':true,
  });


     useWatchContractEvent({
    address: destinationPoolAddress,
    abi: stabilskiTokenPoolAbi,
    'eventName':'Minted',
    args:{
      recipient: address,
      value: BigInt(tokenAmountToSend * 1e18)
    },
   'onLogs':(logs)=>{
    console.log(logs, 'Logs from Transfer');
    toast.success('Successfuly Received PLST Tokens');
    setApproved(false);
    setSourceChainTx(undefined);
   },
    'strict':true,
  
  });


  return (
  <TabsContent value="bridge" className="flex flex-col gap-4 max-w-xl w-full">
    <Card className=" w-full shadow-sm border-red-500 border shadow-black h-96">
  <div className="h-1/2 py-1 px-3 border-b border-red-500 flex gap-3 flex-col">
  <Label className="text-xl text-red-500">Root Chain PLST</Label>
<div className="flex items-center gap-4">
<div className="w-full flex-col gap-2">
  <Label>Amount</Label>
    <Input onChange={(e) => setTokenAmountToSend(Number(e.target.value))} type="number" step={0.001} min={0} max={Number(data)/1e18} className="w-full"/>
</div>

</div>

<div className="">
    <p>Balance: {amountToBeTransfered.toFixed(4)} <span className='text-red-500'>PLST</span></p>
</div>
  </div>
    <div className="h-1/2 w-full py-1 px-3 flex gap-3 flex-col">
  <Label className="text-xl text-red-500">Destination Chain</Label>
   <Select onValueChange={(value)=>{
    console.log(value, 'Selected Value');
    setDestinationChainSelector(value)
   }}>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Token" />
  </SelectTrigger>
  <SelectContent className="bg-white max-w-xl w-full shadow-sm shadow-black rounded-lg">
<SelectOptions/>
  </SelectContent>
</Select>
  </div>

    </Card>

   <div className="flex items-center w-full justify-center gap-3">
     <Button onClick={approveStabilskiTokens} className="p-6  transition-all shadow-sm shadow-black hover:bg-red-600 cursor-pointer hover:scale-95 text-base md:text-lg max-w-40 sm:max-w-72 self-center w-full bg-red-500">Approve Tokens</Button>
      <Button disabled={!approved} onClick={commitCCIPTransfer} className={`p-6 disabled:bg-blue-400 disabled:opacity-95 transition-all shadow-sm shadow-black hover:bg-blue-600 cursor-pointer hover:scale-95 text-base md:text-lg max-w-40 sm:max-w-72 self-center w-full bg-blue-500`}>Bridge Tokens</Button>
   </div>

   {sourceChainTx &&
   <div
   className={
    `flex flex-col gap-2
    
    `
   }
   >
     <Link 
   target="_blank"
   href={`https://ccip.chain.link/#/side-drawer/msg/${sourceChainTx}`} className="text-blue-500 hover:text-blue-900 transition-all underline ">Click to see your transaction</Link>
  
  <Button className='p-3 max-w-52 w-full cursor-pointer hover:bg-gray-800'
onClick={()=>{
navigator.clipboard.writeText(sourceChainTx);
toast.success("Successfully copied tx-hash");
}}
>
  Copy Tx Hash
</Button>


   </div>
   
   }

  </TabsContent>
  )

}

export default BridgeTab;