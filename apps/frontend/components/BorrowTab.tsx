'use client';

import React from 'react'
import { TabsContent } from './ui/tabs'
import { Label } from './ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
import { FaEthereum, FaBitcoin } from 'react-icons/fa6'
import { SiChainlink } from 'react-icons/si'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { useAccount } from 'wagmi'

type Props = {}

function BorrowTab({}: Props) {

const {chainId, address}=useAccount();

  return (
      <TabsContent value="borrow" className="flex flex-col gap-4 max-w-xl w-full">

<Card className=" w-full shadow-sm border-red-500 border shadow-black h-96">
  <div className="h-1/2 py-1 px-3 border-b border-red-500 flex gap-3 flex-col">
  <Label className="text-xl text-red-500">You Borrow</Label>
<div className="flex items-center gap-4">
  <Input type="number" min={0}  className="w-full"/>
 <Select>
  <SelectTrigger className="w-44">
    <SelectValue placeholder="Chain Vaults" />
  </SelectTrigger>
  <SelectContent className="w-44 bg-white shadow-sm shadow-black rounded-lg">
   {chainId && chainId === 11155111 ? <>
        <SelectItem value="WETH"> <FaEthereum className="text-zinc-500"/> Wrapped Ethereum (WETH)</SelectItem>
    <SelectItem value="WBTC"><FaBitcoin className="text-orange-500"/> Wrapped Bitcoin (WBTC)</SelectItem>
    <SelectItem value="LINK "><SiChainlink className="text-blue-500" /> Chainlink (LINK)</SelectItem>
    </> : 
    <>
     <SelectItem value="LINK "><SiChainlink className="text-blue-500" /> Chainlink (LINK)</SelectItem>
    </>}
  </SelectContent>
</Select>
</div>
  </div>
    <div className="h-1/2 py-1 px-3 items-center flex gap-3 flex-col">
 <p className="text-red-500 text-2xl tracking">Your position is</p>

<p>150%</p>

<p>Collaterized</p>

  </div>
</Card>

<Button className="p-6 transition-all shadow-sm shadow-black hover:bg-red-600 cursor-pointer hover:scale-95 text-lg max-w-sm self-center w-full bg-red-500">Borrow Stabilski (PLST)</Button>

  </TabsContent>
  )
}

export default BorrowTab