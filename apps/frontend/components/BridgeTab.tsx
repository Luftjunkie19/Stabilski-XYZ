'use client';

import React, { useState } from 'react'

import { Card } from "./ui/card"
import { TabsContent } from './ui/tabs'
import { Label } from './ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
import { Button } from './ui/button'
import { Input } from './ui/input'
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
import { encodeAbiParameters, zeroAddress } from 'viem';
import { chainSelectorArbitrumSepolia, chainSelectorBaseSepolia, chainSelectorSepoliaEth } from '@/lib/smart-contracts-abi/ccip-routers/StabilskiTokenCCIPNeededData';
import { toast } from 'sonner';

function BridgeTab() {

const {chainId, address}=useAccount();
const [tokenAmountToSend, setTokenAmountToSend] = useState<number>(0);
const [destinationChainSelector, setDestinationChainSelector]=useState<number>();


const {data}=useReadContract({
    abi:stabilskiTokenABI,
    address: chainId === ARBITRUM_SEPOLIA_CHAINID ? stabilskiTokenArbitrumSepoliaAddress : chainId === BASE_SEPOLIA_CHAINID ? stabilskiTokenBaseSepoliaAddress : stabilskiTokenEthSepoliaAddress,
    functionName: 'balanceOf',
    args: [address],
    chainId: chainId
});


const {writeContract}=useWriteContract();


const handleTokenChange = async () => {
try {

  const encodedReceiverAddress = encodeAbiParameters([{type:'address', name:'receiver'}], [address as `0x${string}`]);
  const encodedGasLimit=encodeAbiParameters([{type:'uint256', name:'gasLimit'}], [BigInt(500000)]);


  console.log(encodedReceiverAddress);

const currentStabilskiContract= chainId === ARBITRUM_SEPOLIA_CHAINID ? stabilskiTokenArbitrumSepoliaAddress : chainId === BASE_SEPOLIA_CHAINID ? stabilskiTokenBaseSepoliaAddress : stabilskiTokenEthSepoliaAddress;

const currentRouter= chainId === ARBITRUM_SEPOLIA_CHAINID ? arbitrumSepoliaRouter : chainId === BASE_SEPOLIA_CHAINID ? baseSepoliaRouter : ethereumSepoliaRouter;

const messageObj={
    receiver:encodedReceiverAddress,
    data:"",
    tokenAmounts:[{token:currentStabilskiContract, amount:BigInt(5e18)}],
    feeToken:zeroAddress,
    extraArgs: encodedGasLimit
  }

  const getFee = await readContract(config, {
    abi:routerAbi,
    address: currentRouter,
    functionName:"getFee",
    args:[BigInt(chainSelectorBaseSepolia), messageObj],
    chainId
  });

  console.log(getFee);

writeContract({
    abi:routerAbi,
    address: currentRouter,
    functionName:"ccipSend",
    args:[BigInt(chainSelectorBaseSepolia), messageObj],
    chainId
  });


} catch (error) {
  console.log(error);
  toast.error("Could not retrieve fees");
}
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
    <Input onChange={(e) => setTokenAmountToSend(Number(e.target.value))} type="number" min={0} max={Number(data)/1e18} className="w-full"/>
</div>
{/* <div className="flex-col gap-1">
  <Label>Chain</Label>
 <Select>
  <SelectTrigger className="w-44">
    <SelectValue onChange={(event) => console.log(event.target)} placeholder="Token" />
  </SelectTrigger>
  <SelectContent className="w-44 bg-white shadow-sm shadow-black rounded-lg">
<SelectOptions/>
  </SelectContent>
</Select>
</div> */}
</div>

<div className="">
    <p>Balance: {data as unknown as bigint && Number(data) / 1e18} <span className='text-red-500'>PLST</span></p>
</div>
  </div>
    <div className="h-1/2 w-full py-1 px-3 flex gap-3 flex-col">
  <Label className="text-xl text-red-500">Destination Chain</Label>
   <Select onValueChange={(value)=>setDestinationChainSelector(Number(value))}>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Token" />
  </SelectTrigger>
  <SelectContent className="bg-white max-w-xl w-full shadow-sm shadow-black rounded-lg">
<SelectOptions/>
  </SelectContent>
</Select>
  </div>

    </Card>

    <Button onClick={handleTokenChange} className="p-6 transition-all shadow-sm shadow-black hover:bg-red-600 cursor-pointer hover:scale-95 text-lg max-w-sm self-center w-full bg-red-500">Bridge Tokens</Button>
  </TabsContent>
  )
}

export default BridgeTab