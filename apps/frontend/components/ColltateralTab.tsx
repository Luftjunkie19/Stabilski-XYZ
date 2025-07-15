'use client';

import React, { useState } from 'react'
import { TabsContent } from './ui/tabs'
import { Label } from './ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
import { FaEthereum, FaBitcoin } from 'react-icons/fa6'
import { SiChainlink } from 'react-icons/si'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { useAccount, useReadContracts, useWriteContract } from 'wagmi'
import { ARBITRUM_SEPOLIA_LINK_ADDR, SEPOLIA_ETH_CHAINID, SEPOLIA_ETH_LINK_ABI, SEPOLIA_ETH_LINK_ADDR, SEPOLIA_ETH_WBTC_ABI, SEPOLIA_ETH_WBTC_ADDR, SEPOLIA_ETH_WETH_ABI, SEPOLIA_ETH_WETH_ADDR } from '@/lib/CollateralContractAddresses';

import { ethSepoliaVaultManagerAddress, vaultManagerAbi } from '@/smart-contracts-abi/VaultManager';
import {  stabilskiTokenCollateralManagerAbi, stabilskiTokenSepoliaEthCollateralManagerAddress } from '@/smart-contracts-abi/CollateralManager';
import { readContract } from 'viem/actions';



function ColltateralTab() {
  const [amount, setAmount] = useState<number>(0);
  const [token, setToken] = useState<`0x${string}`>();
  const [maximumAmount, setMaximumAmount] = useState<number>(0);
    const {chainId, address}=useAccount();

    const {writeContract}=useWriteContract({

    });

    const arrayOfContracts=[
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
    }
    ]

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
    }
    ]});

      const {data:collateralData}=useReadContracts({contracts:[
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
    }
    ]});



  return (
    <TabsContent value="collateral" className="flex flex-col gap-4 max-w-xl w-full">

<Card className=" w-full shadow-sm border-red-500 border shadow-black h-96">
  <div className="h-1/2 py-1 px-3 border-b border-red-500 flex gap-3 flex-col">
  <Label className="text-xl text-red-500">You Give</Label>
<div className="flex items-center gap-4">
  <Input onChange={(e)=>setAmount(Number(e.target.value))} type="number" min={0} max={maximumAmount}  className="w-full"/>
 <Select value={token} onValueChange={(value) => {
setToken(value as `0x${string}`);
if(data) setMaximumAmount(Number(data[arrayOfContracts.findIndex(contract => contract.address === value)].result) / 1e18)
 }}>
  <SelectTrigger className="w-44">
    <SelectValue  placeholder="Token" />
  </SelectTrigger>
  <SelectContent className="w-64 relative bg-white shadow-sm shadow-black rounded-lg">
    {chainId && chainId === 11155111 ? <>
        <SelectItem value={SEPOLIA_ETH_WETH_ADDR}> <FaEthereum className="text-zinc-500"/> Wrapped Ethereum (WETH)</SelectItem>
    <SelectItem value={SEPOLIA_ETH_WBTC_ADDR}><FaBitcoin className="text-orange-500"/> Wrapped Bitcoin (WBTC)</SelectItem>
    <SelectItem value={SEPOLIA_ETH_LINK_ADDR}><SiChainlink className="text-blue-500" /> Chainlink (LINK)</SelectItem>
    </> : 
    <>
     <SelectItem value={ARBITRUM_SEPOLIA_LINK_ADDR}><SiChainlink className="text-blue-500" /> Chainlink (LINK)</SelectItem>
    </>}
  </SelectContent>
</Select>
</div>
  </div>
    <div className="h-1/2 py-1 px-3 flex gap-3 flex-col">
  <Label className="text-lg text-zinc-700">You Will Be Able To Borrow (Max.)</Label>
<div className="p-2 rounded-lg border-gray-300 border">
  <p>{0}</p>
</div>  
  </div>
</Card>
{data && 
<div onClick={() => console.log(data)} className="w-full flex items-center gap-6">
<div className='flex items-center gap-1'>
  <FaBitcoin className='text-orange-500'/>: {(data[0] && Number(data[0].result) / 1e8).toFixed(4)}
</div>
<div className='flex items-center gap-1'><FaEthereum className='text-zinc-500'/>: {(data[1] && Number(data[1].result) / 1e18).toFixed(6)}</div>
<div className='flex items-center gap-1'><SiChainlink className='text-blue-500'/>: {data[2] && (Number(data[2].result) / 1e18).toFixed(4)}</div>
</div>
}

{collateralData && 
<div onClick={() => console.log(collateralData)} className="w-full flex items-center gap-6">
<div className='flex items-center gap-1'>
  <FaBitcoin className='text-orange-500'/>: {collateralData[0] && (Number(collateralData[0].result) / 1e18).toFixed(4)} $
</div>
<div className='flex items-center gap-1'><FaEthereum className='text-zinc-500'/>: {(collateralData[1] && Number(collateralData[1].result)/ 1e18).toFixed(4)} $</div>
<div className='flex items-center gap-1'><SiChainlink className='text-blue-500'/>: {collateralData[2] && (Number(collateralData[2].result) / 1e18).toFixed(4)} $</div>
</div>
}

<div className="flex flex-wrap w-full gap-2 justify-center">
<Button onClick={()=>{
if(token){
    writeContract({
    'abi':arrayOfContracts.find(contract => contract.address === token)!.abi,
    'address':arrayOfContracts.find(contract => contract.address === token)!.address as `0x${string}`,
    'functionName':'approve',
    'args':[ethSepoliaVaultManagerAddress, amount * 1e18],
  })
}
}} className="p-6 transition-all shadow-sm shadow-black hover:bg-blue-900 cursor-pointer hover:scale-95 text-lg max-w-52 self-center w-full bg-blue-500">Approve Collateral</Button>
  
<Button onClick={()=>{
  writeContract({
    'abi':vaultManagerAbi,
    'address':ethSepoliaVaultManagerAddress,
    'functionName':'depositCollateral',
    'args':[token, amount * 1e18],
  })
}} className="p-6 transition-all shadow-sm shadow-black hover:bg-red-600 cursor-pointer hover:scale-95 text-lg max-w-52 self-center w-full bg-red-500">Put Collateral</Button>
</div>


  </TabsContent>
  )
}

export default ColltateralTab