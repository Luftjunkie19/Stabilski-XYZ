/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useAccount, useReadContracts, useSwitchChain, useWriteContract } from 'wagmi'
import {  ARBITRUM_SEPOLIA_ABI, ARBITRUM_SEPOLIA_CHAINID, ARBITRUM_SEPOLIA_LINK_ADDR, SEPOLIA_ETH_CHAINID, SEPOLIA_ETH_LINK_ABI, SEPOLIA_ETH_LINK_ADDR, SEPOLIA_ETH_WBTC_ABI, SEPOLIA_ETH_WBTC_ADDR, SEPOLIA_ETH_WETH_ABI, SEPOLIA_ETH_WETH_ADDR } from '@/lib/CollateralContractAddresses';

import { arbitrumSepoliaVaultManagerAddress, ethSepoliaVaultManagerAddress, vaultManagerAbi } from '@/lib/smart-contracts-abi/VaultManager';
import {  stabilskiTokenArbitrumSepoliaCollateralManagerAddress, stabilskiTokenCollateralManagerAbi } from '@/lib/smart-contracts-abi/CollateralManager';
import ChainDataWidget from './chain-data/ethereum/ChainDataWidget';
import ArbitrumDataWidget from './chain-data/arbitrum/ArbitrumDataWidget';


function BorrowTab() {

  useSwitchChain({mutation:{
    onSuccess:(data)=>{
      console.log(data);
      setToken(undefined);
      setAmount(0);

    }
  }});

const {writeContract}=useWriteContract({
});

 const [amount, setAmount] = useState<number>(0);
  const [token, setToken] = useState<`0x${string}` | undefined>(undefined);
const {chainId, address}=useAccount();
  const [maximumAmount, setMaximumAmount] = useState<number>(0);

 // eslint-disable-next-line react-hooks/exhaustive-deps
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
        },
         {
             'abi':ARBITRUM_SEPOLIA_ABI,
            'address':ARBITRUM_SEPOLIA_LINK_ADDR,
            'functionName':'balanceOf',
            'args':[address],
            chainId:ARBITRUM_SEPOLIA_CHAINID
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
        }
      ]
    });


const borrowPolishStableCoin= ()=>{
if(chainId === ARBITRUM_SEPOLIA_CHAINID){
  writeContract({
    abi:stabilskiTokenCollateralManagerAbi,
    address:stabilskiTokenArbitrumSepoliaCollateralManagerAddress,
    functionName:'mintPLST',
    args:[token, amount * 10 ** 18],
    chainId:ARBITRUM_SEPOLIA_CHAINID
});
return;
}
  writeContract({
    abi:vaultManagerAbi,
    address:ethSepoliaVaultManagerAddress,
    functionName:'mintPLST',
    args:[token, amount * 10 ** 18],
    chainId:SEPOLIA_ETH_CHAINID
  });
}



  return (
      <TabsContent value="borrow" className="flex flex-col gap-4 max-w-7xl w-full">
      
<Card className=" w-full max-w-xl self-center shadow-sm border-red-500 border shadow-black h-96">
  <div className="h-1/2 py-1 px-3 border-b border-red-500 flex gap-3 flex-col">
  <Label className="text-xl text-red-500">You Borrow</Label>
<div className="flex items-center gap-4">
  <Input onChange={(e) =>setAmount(Number(e.target.value))} type="number" step={0.01} min={0} max={maximumAmount} className="w-full"/>
 <Select onValueChange={(value)=>{
 setToken(value as `0x${string}`);
 if(maxBorrowableData) setMaximumAmount(Number(maxBorrowableData[arrayOfContracts.findIndex(contract => contract.address === value)].result) / (value === SEPOLIA_ETH_WBTC_ADDR ? 1e8 :1e18));

 }}>
  <SelectTrigger className="w-44">
    <SelectValue placeholder="Vaults" />
  </SelectTrigger>
  <SelectContent className="max-w-64 w-full bg-white shadow-sm shadow-black rounded-lg">
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
    <div className="h-1/2 py-1 px-3 items-center flex gap-3 flex-col">
 <p className="text-red-500 text-2xl tracking">Your can still borrow</p>
<p>{maxBorrowableData as unknown as any && vaultContractInfo as unknown as any && token && arrayOfContracts.find((contract) => contract.address === token) || arrayOfContracts.findIndex((contract) => contract.address === token) !== -1   ?  (((Number((maxBorrowableData as unknown as any)[arrayOfContracts.findIndex((contract) => contract.address === token)].result)) - (amount * 10 ** 18))/ 1e18).toFixed(2) : 0 } <span className='text-red-500'>PLST</span></p>

  </div>
</Card>

<Button onClick={borrowPolishStableCoin} className="p-6 transition-all shadow-sm shadow-black hover:bg-red-600 cursor-pointer hover:scale-95 text-lg max-w-sm self-center w-full bg-red-500">Borrow Stabilski (PLST)</Button>

<div className="flex items-center w-full gap-6">

{chainId === SEPOLIA_ETH_CHAINID && <>
<ChainDataWidget/>
</>}


{chainId === ARBITRUM_SEPOLIA_CHAINID && <>
<ArbitrumDataWidget/>
</>}

</div>

  </TabsContent>
  )
}

export default BorrowTab