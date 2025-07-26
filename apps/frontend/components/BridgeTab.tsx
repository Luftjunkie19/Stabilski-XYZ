'use client';

import React from 'react'

import { Card } from "./ui/card"
import { TabsContent } from './ui/tabs'
import { Label } from './ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
import { Button } from './ui/button'
import { Input } from './ui/input'
import Image from 'next/image';
import arbitrumLogo from "@/public/arbitrum-logo.png";
import { FaEthereum } from 'react-icons/fa6';
import { useAccount, useReadContract } from 'wagmi';
import { stabilskiTokenABI, stabilskiTokenArbitrumSepoliaAddress, stabilskiTokenEthSepoliaAddress } from '@/lib/smart-contracts-abi/StabilskiToken';
import { ARBITRUM_SEPOLIA_CHAINID, SEPOLIA_ETH_CHAINID } from '@/lib/CollateralContractAddresses';

function BridgeTab() {

const {chainId, address}=useAccount();

const {data}=useReadContract({
    abi:stabilskiTokenABI,
    address: chainId === ARBITRUM_SEPOLIA_CHAINID ? stabilskiTokenArbitrumSepoliaAddress : stabilskiTokenEthSepoliaAddress,
    functionName: 'balanceOf',
    args: [address],
    chainId: chainId
});

  return (
  <TabsContent value="bridge" className="flex flex-col gap-4 max-w-xl w-full">
    <Card className=" w-full shadow-sm border-red-500 border shadow-black h-96">
  <div className="h-1/2 py-1 px-3 border-b border-red-500 flex gap-3 flex-col">
  <Label className="text-xl text-red-500">Root Chain PLST</Label>
<div className="flex items-center gap-4">
<div className="w-full flex-col gap-1">
  <Label>Amount</Label>
    <Input type="number" min={0} max={Number(data)/1e18} className="w-full"/>
</div>
<div className="flex-col gap-1">
  <Label>Chain</Label>
 <Select>
  <SelectTrigger className="w-44">
    <SelectValue onChange={(event) => console.log(event.target)} placeholder="Token" />
  </SelectTrigger>
  <SelectContent className="w-44 bg-white shadow-sm shadow-black rounded-lg">
{chainId === ARBITRUM_SEPOLIA_CHAINID ? (
  <SelectItem className='text-xs flex items-center gap-2' value={`${ARBITRUM_SEPOLIA_CHAINID}`}>
<Image src={arbitrumLogo} className='w-5 h-5' width={20} height={20} alt='logo'/>
    <span>
        Arbitrum Sepolia (ARB)
    </span>
</SelectItem>
) : ( <SelectItem className='text-xs' value={`${SEPOLIA_ETH_CHAINID}`}><FaEthereum className="text-gray-500"/>  Ethereum Sepolia (ETH)</SelectItem>)}
   
  </SelectContent>
</Select>
</div>
</div>

<div className="">
    <p>Balance: {data as unknown as bigint && Number(data) / 1e18} <span className='text-red-500'>PLST</span></p>
</div>
  </div>
    <div className="h-1/2 w-full py-1 px-3 flex gap-3 flex-col">
  <Label className="text-xl text-red-500">Destination Chain</Label>
   <Select>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Token" />
  </SelectTrigger>
  <SelectContent className="bg-white max-w-xl w-full shadow-sm shadow-black rounded-lg">
{chainId === ARBITRUM_SEPOLIA_CHAINID ? (
  <SelectItem className='text-xs flex items-center gap-2' value={`${SEPOLIA_ETH_CHAINID}`}>
<FaEthereum className='text-gray-500'/>
    <span>
        Ethereum Sepolia (ETH)
    </span>
</SelectItem>
) : ( <SelectItem className='text-xs' value={`${ARBITRUM_SEPOLIA_CHAINID}`}>
<Image src={arbitrumLogo} className='w-5 h-5' width={20} height={20} alt='logo'/> Arbitrum Sepolia (ARB)
  </SelectItem>)}
  </SelectContent>
</Select>
  </div>

    </Card>

    <Button className="p-6 transition-all shadow-sm shadow-black hover:bg-red-600 cursor-pointer hover:scale-95 text-lg max-w-sm self-center w-full bg-red-500">Bridge Tokens</Button>
  </TabsContent>
  )
}

export default BridgeTab