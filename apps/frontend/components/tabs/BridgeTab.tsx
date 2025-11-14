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
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { stabilskiTokenABI, stabilskiTokenArbitrumSepoliaAddress, stabilskiTokenBaseSepoliaAddress, stabilskiTokenEthSepoliaAddress } from '@/lib/smart-contracts-abi/StabilskiToken';
import { ARBITRUM_SEPOLIA_CHAINID, BASE_SEPOLIA_CHAINID, SEPOLIA_ETH_CHAINID } from '@/lib/CollateralContractAddresses';
import { arbitrumSepoliaRouter, baseSepoliaRouter, ethereumSepoliaRouter, routerAbi } from '@/lib/smart-contracts-abi/ccip-routers/Router';
import { config } from '@/lib/Web3Provider';
import { readContract } from '@wagmi/core'

import { toast } from 'sonner';
import { ccipInformationRetrieverAbi, ccipInformationRetrieverSepoliaArbAddress, ccipInformationRetrieverSepoliaBaseAddress, ccipInformationRetrieverSepoliaEthAddress } from '@/lib/smart-contracts-abi/ccip-routers/StabilskiTokenCCIPNeededData';

function BridgeTab() {
const chainSelectorArbitrumSepolia = BigInt('3478487238524512106');
const chainSelectorSepoliaEth = BigInt('16015286601757825753');
const chainSelectorBaseSepolia= BigInt('10344971235874465080');

const {chainId, address}=useAccount();
const [tokenAmountToSend, setTokenAmountToSend] = useState<number>(0);
const [destinationChainSelector, setDestinationChainSelector]=useState<string>();


const {data}=useReadContract({
    abi:stabilskiTokenABI,
    address: chainId === ARBITRUM_SEPOLIA_CHAINID ? stabilskiTokenArbitrumSepoliaAddress : chainId === BASE_SEPOLIA_CHAINID ? stabilskiTokenBaseSepoliaAddress : stabilskiTokenEthSepoliaAddress,
    functionName: 'balanceOf',
    args: [address],
    chainId: chainId
});


const {writeContract, writeContractAsync}=useWriteContract();

const getCurrentRouter= ()=>{
  switch(chainId){
    case ARBITRUM_SEPOLIA_CHAINID:
      return arbitrumSepoliaRouter
    
    case BASE_SEPOLIA_CHAINID:
      return baseSepoliaRouter

    case SEPOLIA_ETH_CHAINID:
    return ethereumSepoliaRouter
  }
}

const getCurrentCcipRetriever= ()=>{
  switch(chainId){
    case SEPOLIA_ETH_CHAINID:
      return ccipInformationRetrieverSepoliaEthAddress
    
    case ARBITRUM_SEPOLIA_CHAINID:
      return ccipInformationRetrieverSepoliaArbAddress

    case BASE_SEPOLIA_CHAINID:
    return ccipInformationRetrieverSepoliaBaseAddress
  }
}


const currentRouter= getCurrentRouter();
const currentRetriever = getCurrentCcipRetriever();

const amountToBeTransfered = useMemo(()=>{
return (Number(data) / 1e18) - tokenAmountToSend;
},[tokenAmountToSend, data])

const approveStabilskiTokens = async () => {
try {

const currentStabilskiContract= chainId === ARBITRUM_SEPOLIA_CHAINID ? stabilskiTokenArbitrumSepoliaAddress : chainId === BASE_SEPOLIA_CHAINID ? stabilskiTokenBaseSepoliaAddress : stabilskiTokenEthSepoliaAddress;

console.log(currentRouter);

console.log(amountToBeTransfered);

if(!currentRouter){
  toast.error("No router, no party !");
  return;
}

  const isArbitrumSepoliaSupported = await readContract(config, {
    abi:routerAbi,
    address: currentRouter,
    functionName:"isChainSupported",
    args:[destinationChainSelector]
  });

console.log(isArbitrumSepoliaSupported, 'Is arbitrum supported by eth sepolia router');

const turnedTokenAmountToSend= BigInt(tokenAmountToSend * 1e18);



writeContract({
  abi:stabilskiTokenABI,
    address: currentStabilskiContract,
    functionName:"approve",
    args:[currentRouter, turnedTokenAmountToSend],
    chainId
})

// writeContract({
//     abi:routerAbi,
//     address: currentRouter,
//     functionName:"ccipSend",
//     args:[destinationChainSelector, getCcipMessage],
//     chainId,
//     value: getFee as unknown as bigint
//   });


} catch (error) {
  console.log(error);
  toast.error("Could not retrieve fees");
}
}

const commitCCIPTransfer= async ()=>{
const currentStabilskiContract= chainId === ARBITRUM_SEPOLIA_CHAINID ? stabilskiTokenArbitrumSepoliaAddress : chainId === BASE_SEPOLIA_CHAINID ? stabilskiTokenBaseSepoliaAddress : stabilskiTokenEthSepoliaAddress;


const allowanceStabilskiToken= await readContract(config, {
    abi:stabilskiTokenABI,
    address: currentStabilskiContract,
    functionName:"allowance",
    args:[address, currentRouter]
});

console.log('Allowance', allowanceStabilskiToken)

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

  console.log(getFee, 'Fee to be paid');

  console.log(getCcipMessage, 'CCIP Message');


   await writeContractAsync({
    abi:routerAbi,
    address: currentRouter as `0x${string}`,
    functionName:"ccipSend",
    args:[destinationChainSelector, getCcipMessage],
    chainId,
    value: getFee as any,
    'gas':BigInt(500_000) 
    
  });

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
    <p>Balance: {amountToBeTransfered} <span className='text-red-500'>PLST</span></p>
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
     <Button onClick={approveStabilskiTokens} className="p-6  transition-all shadow-sm shadow-black hover:bg-red-600 cursor-pointer hover:scale-95 text-lg max-w-72 self-center w-full bg-red-500">Approve Tokens</Button>
      <Button onClick={commitCCIPTransfer} className="p-6  transition-all shadow-sm shadow-black hover:bg-blue-600 cursor-pointer hover:scale-95 text-lg max-w-72 self-center w-full bg-blue-500">Bridge Tokens</Button>
   </div>
  </TabsContent>
  )
}

export default BridgeTab