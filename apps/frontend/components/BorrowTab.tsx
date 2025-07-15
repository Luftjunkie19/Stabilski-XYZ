/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback, useMemo, useState } from 'react'
import { TabsContent } from './ui/tabs'
import { Label } from './ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
import { FaEthereum, FaBitcoin } from 'react-icons/fa6'
import { SiChainlink } from 'react-icons/si'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { useAccount, useReadContract, useReadContracts, useWriteContract } from 'wagmi'
import {  ARBITRUM_SEPOLIA_LINK_ADDR, SEPOLIA_ETH_CHAINID, SEPOLIA_ETH_LINK_ABI, SEPOLIA_ETH_LINK_ADDR, SEPOLIA_ETH_WBTC_ABI, SEPOLIA_ETH_WBTC_ADDR, SEPOLIA_ETH_WETH_ABI, SEPOLIA_ETH_WETH_ADDR } from '@/lib/CollateralContractAddresses';

import { arbitrumSepoliaVaultManagerAddress, ethSepoliaVaultManagerAddress, vaultManagerAbi } from '@/smart-contracts-abi/VaultManager';
import {  stabilskiTokenCollateralManagerAbi, stabilskiTokenSepoliaEthCollateralManagerAddress } from '@/smart-contracts-abi/CollateralManager';
import { usdplnOracleABI, usdplnOracleArbitrumSepoliaAddress, usdplnOracleEthSepoliaAddress } from '@/smart-contracts-abi/USDPLNOracle';


function BorrowTab() {
const {writeContract}=useWriteContract({
});

 const [amount, setAmount] = useState<number>(0);
  const [token, setToken] = useState<`0x${string}` | undefined>(undefined);
  const [maximumAmount, setMaximumAmount] = useState<number>(0);
const {chainId, address}=useAccount();

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
    }
    ]

  //   const {data}=useReadContracts({contracts:[
  //  {
  //        'abi':SEPOLIA_ETH_WBTC_ABI,
  //       'address':SEPOLIA_ETH_WBTC_ADDR,
  //       'functionName':'balanceOf',
  //       'args':[address],
  //       chainId:SEPOLIA_ETH_CHAINID
  //   },
  //       {
  //        'abi':SEPOLIA_ETH_WETH_ABI,
  //       'address':SEPOLIA_ETH_WETH_ADDR,
  //       'functionName':'balanceOf',
  //       'args':[address],
  //       chainId:SEPOLIA_ETH_CHAINID
  //   },
  //       {
  //        'abi':SEPOLIA_ETH_LINK_ABI,
  //       'address':SEPOLIA_ETH_LINK_ADDR,
  //       'functionName':'balanceOf',
  //       'args':[address],
  //       chainId:SEPOLIA_ETH_CHAINID
  //   }
  //   ]});

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
    }
    ]});

    const {data:usdplnOraclePrice}=useReadContract({
         'abi': usdplnOracleABI,
        'address':usdplnOracleEthSepoliaAddress,
        'functionName':'getPLNPrice',
        'args':[],
        chainId:SEPOLIA_ETH_CHAINID
    })

const {data:arbitrumOraclePrice}=useReadContract({
  'abi': usdplnOracleABI,
 'address':usdplnOracleArbitrumSepoliaAddress,
 'functionName':'getPLNPrice',
 'args':[],
 chainId:SEPOLIA_ETH_CHAINID
})

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
          chainId:SEPOLIA_ETH_CHAINID
        }
      ]
    })

    const getTheMaxAmountOfTokensToBorrow= useMemo(()=>{

      if(!maxBorrowableData && !token) return 0

      if(!(maxBorrowableData as unknown as any)[arrayOfContracts.findIndex((contract) => contract.address === token)]){
        return 0
      }

      const collateralMaxBorrowable = (maxBorrowableData as unknown as any)[arrayOfContracts.findIndex((contract) => contract.address === token)].result ?? 0;
     

      return Number(collateralMaxBorrowable as unknown as bigint) / 10 ** 18;
 


},[maxBorrowableData, arrayOfContracts, token]);



const borrowPolishStableCoin= ()=>{
  writeContract({
    abi:vaultManagerAbi,
    address:ethSepoliaVaultManagerAddress,
    functionName:'mintPLST',
    args:[token, amount * 10 ** 18],
    chainId:SEPOLIA_ETH_CHAINID
  });
}

  return (
      <TabsContent value="borrow" className="flex flex-col gap-4 max-w-xl w-full">
      
<Card className=" w-full shadow-sm border-red-500 border shadow-black h-96">
  <div className="h-1/2 py-1 px-3 border-b border-red-500 flex gap-3 flex-col">
  <Label className="text-xl text-red-500">You Borrow</Label>
<div className="flex items-center gap-4">
  <Input onChange={(e) =>setAmount(Number(e.target.value))} type="number" min={0} max={maximumAmount} className="w-full"/>
 <Select onValueChange={(value)=>{
  setToken(value as `0x${string}`);
 if(value) setMaximumAmount(getTheMaxAmountOfTokensToBorrow)

 }}>
  <SelectTrigger className="w-44">
    <SelectValue placeholder="Chain Vaults" />
  </SelectTrigger>
  <SelectContent className="max-w-64 w-full bg-white shadow-sm shadow-black rounded-lg">
   {chainId && chainId === 11155111 ? <>
        <SelectItem value={SEPOLIA_ETH_WETH_ADDR}> <FaEthereum className="text-zinc-500"/> Wrapped Ethereum (WETH)</SelectItem>
    <SelectItem value={SEPOLIA_ETH_WBTC_ADDR}><FaBitcoin className="text-orange-500"/> Wrapped Bitcoin (WBTC)</SelectItem>
    <SelectItem value={SEPOLIA_ETH_LINK_ADDR}><SiChainlink className="text-blue-500" /> Chainlink (LINK)</SelectItem>
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
<p>{vaultContractInfo as unknown as any && (Number((vaultContractInfo as unknown as any)[arrayOfContracts.findIndex((contract) => contract.address === token)]?.result) / (amount * 10 ** 18) * 100)}%</p>

<p>Collaterized</p>

  </div>
</Card>
<p onClick={()=>console.log(arbitrumOraclePrice, usdplnOraclePrice)}>Click and check</p>
{arbitrumOraclePrice as unknown as bigint && <p className="text-red-500 text-2xl tracking">Arbitrum Oracle Price: {Number(arbitrumOraclePrice)}</p>}
<Button onClick={borrowPolishStableCoin} className="p-6 transition-all shadow-sm shadow-black hover:bg-red-600 cursor-pointer hover:scale-95 text-lg max-w-sm self-center w-full bg-red-500">Borrow Stabilski (PLST)</Button>

  </TabsContent>
  )
}

export default BorrowTab