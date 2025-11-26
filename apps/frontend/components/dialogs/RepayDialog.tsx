'use client';

import React, {  useState } from 'react'
import { Button } from '../ui/button'
import { DialogHeader,Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { useAccount,  useReadContracts, useWriteContract } from 'wagmi';
import { SEPOLIA_ETH_WETH_ADDR, SEPOLIA_ETH_WBTC_ADDR, SEPOLIA_ETH_LINK_ADDR, ARBITRUM_SEPOLIA_CHAINID, ARBITRUM_SEPOLIA_LINK_ADDR, SEPOLIA_ETH_CHAINID, BASE_SEPOLIA_CHAINID, BASE_SEPOLIA_LINK_ADDR, BASE_SEPOLIA_WETH_ADDR } from '@/lib/CollateralContractAddresses';
import { FaEthereum, FaBitcoin } from 'react-icons/fa6';
import { SiChainlink } from 'react-icons/si';
import { Label } from '../ui/label';
import { stabilskiTokenABI, stabilskiTokenArbitrumSepoliaAddress, stabilskiTokenBaseSepoliaAddress, stabilskiTokenEthSepoliaAddress } from '@/lib/smart-contracts-abi/StabilskiToken';
import { arbitrumSepoliaVaultManagerAddress, baseSepoliaVaultManagerAddress, ethSepoliaVaultManagerAddress, vaultManagerAbi } from '@/lib/smart-contracts-abi/VaultManager';
import { singleResultType, vaultInfoReturnType } from '@/lib/types/onChainData/OnChainDataTypes';




function RepayDialog() {
 const [amount, setAmount] = useState<number>(0);
  const [token, setToken] = useState<`0x${string}` | undefined>(undefined);
  const [maximumAmount, setMaximumAmount] = useState<number>(0);
const { address, chainId }=useAccount();

 const arrayOfContracts=[
   {
         'abi':stabilskiTokenABI,
        'address':stabilskiTokenEthSepoliaAddress,
        'functionName':'balanceOf',
        'args':[address],
        chainId:SEPOLIA_ETH_CHAINID
    },
        {
         'abi':stabilskiTokenABI,
        'address':stabilskiTokenArbitrumSepoliaAddress,
        'functionName':'balanceOf',
        'args':[address],
        chainId:ARBITRUM_SEPOLIA_CHAINID
    },
    ];

    const vaultInfoContracts=[
          {
      'abi':vaultManagerAbi,
      'address':ethSepoliaVaultManagerAddress,
      'functionName':'getVaultInfo',
      'args':[address, SEPOLIA_ETH_WETH_ADDR],
      chainId:SEPOLIA_ETH_CHAINID,
    },
        {
      'abi':vaultManagerAbi,
      'address':ethSepoliaVaultManagerAddress,
      'functionName':'getVaultInfo',
      'args':[address, SEPOLIA_ETH_WBTC_ADDR],
      chainId:SEPOLIA_ETH_CHAINID,
    },
    {
      'abi':vaultManagerAbi,
      'address':ethSepoliaVaultManagerAddress,
      'functionName':'getVaultInfo',
      'args':[address, SEPOLIA_ETH_LINK_ADDR],
      chainId:SEPOLIA_ETH_CHAINID,
    },
    {
      'abi':vaultManagerAbi,
      'address':arbitrumSepoliaVaultManagerAddress,
      'functionName':'getVaultInfo',
      'args':[address, ARBITRUM_SEPOLIA_LINK_ADDR],
      chainId:ARBITRUM_SEPOLIA_CHAINID,
    },
     {
      'abi':vaultManagerAbi,
      'address':baseSepoliaVaultManagerAddress,
      'functionName':'getVaultInfo',
      'args':[address, BASE_SEPOLIA_LINK_ADDR],
      chainId:BASE_SEPOLIA_CHAINID,
    },
     {
      'abi':vaultManagerAbi,
      'address':baseSepoliaVaultManagerAddress,
      'functionName':'getVaultInfo',
      'args':[address, BASE_SEPOLIA_WETH_ADDR],
      chainId:BASE_SEPOLIA_CHAINID,
    },
    ]

    const {data:stabilskiBalances}=useReadContracts({contracts:[
   {
         'abi':stabilskiTokenABI,
        'address':stabilskiTokenEthSepoliaAddress,
        'functionName':'balanceOf',
        'args':[address],
        chainId:SEPOLIA_ETH_CHAINID
    },
        {
         'abi':stabilskiTokenABI,
        'address':stabilskiTokenArbitrumSepoliaAddress,
        'functionName':'balanceOf',
        'args':[address],
        chainId:ARBITRUM_SEPOLIA_CHAINID
    },
      {
         'abi':stabilskiTokenABI,
        'address':stabilskiTokenBaseSepoliaAddress,
        'functionName':'balanceOf',
        'args':[address],
        chainId:BASE_SEPOLIA_CHAINID
    }
    ]});

    const {data:vaultInfo}=useReadContracts(
  {
    contracts:[
          {
      'abi':vaultManagerAbi,
      'address':ethSepoliaVaultManagerAddress,
      'functionName':'getVaultInfo',
      'args':[address, SEPOLIA_ETH_WETH_ADDR],
      chainId:SEPOLIA_ETH_CHAINID,
    },
        {
      'abi':vaultManagerAbi,
      'address':ethSepoliaVaultManagerAddress,
      'functionName':'getVaultInfo',
      'args':[address, SEPOLIA_ETH_WBTC_ADDR],
      chainId:SEPOLIA_ETH_CHAINID,
    },
    {
      'abi':vaultManagerAbi,
      'address':ethSepoliaVaultManagerAddress,
      'functionName':'getVaultInfo',
      'args':[address, SEPOLIA_ETH_LINK_ADDR],
      chainId:SEPOLIA_ETH_CHAINID,
    },
    {
      'abi':vaultManagerAbi,
      'address':arbitrumSepoliaVaultManagerAddress,
      'functionName':'getVaultInfo',
      'args':[address, ARBITRUM_SEPOLIA_LINK_ADDR],
      chainId:ARBITRUM_SEPOLIA_CHAINID,
    },
      {
      'abi':vaultManagerAbi,
      'address':baseSepoliaVaultManagerAddress,
      'functionName':'getVaultInfo',
      'args':[address, BASE_SEPOLIA_LINK_ADDR],
      chainId:BASE_SEPOLIA_CHAINID,
    },
    {
      'abi':vaultManagerAbi,
      'address':baseSepoliaVaultManagerAddress,
      'functionName':'getVaultInfo',
      'args':[address, BASE_SEPOLIA_WETH_ADDR],
      chainId:ARBITRUM_SEPOLIA_CHAINID,
    },

    ]
  }
  );

const {writeContract}=useWriteContract();




  return (
   <Dialog>
  <DialogTrigger className={`bg-blue-500 cursor-pointer hover:bg-blue-800 hover:scale-95 p-2 text-white text-sm transition-all rounded-md`}>
 Repay
  </DialogTrigger>
  <DialogContent className='flex flex-col gap-4 items-center w-full '>
    <DialogHeader>
      <DialogTitle>Repay Your Debt</DialogTitle>
      <DialogDescription>
        Here you can repay your debt to the protocol and get part of your collateral pack.
      </DialogDescription>
    </DialogHeader>

<div className="flex items-center gap-2 w-full">
  
  <div className="w-full flex flex-col gap-1">
    <Label>Amount</Label>
    <Input value={amount} onChange={(e) =>setAmount(Number(e.target.value))} type="number" min={0} max={maximumAmount} className="w-full"/>
  </div>
<div className="max-w-24 w-full flex flex-col gap-1">
  <Label>Vault</Label>
   <Select onValueChange={(value)=>{
  setToken(value as `0x${string}`);
  if(value  && vaultInfoContracts.findIndex((info)=>info.args[1] === value) !== -1  && (vaultInfo as unknown as vaultInfoReturnType) && ((vaultInfo as unknown as vaultInfoReturnType)[vaultInfoContracts.findIndex((info)=>info.args[1] === value)])) {
    setMaximumAmount(Number(((vaultInfo as unknown as vaultInfoReturnType)[vaultInfoContracts.findIndex((info)=>info.args[1] === value)] as unknown as singleResultType<vaultInfoReturnType>).result[1]) / 1e18);
  }

 }}>
  <SelectTrigger className="max-w-24">
    <SelectValue placeholder="Vault" />
  </SelectTrigger>
  <SelectContent className="max-w-64 w-full bg-white shadow-sm shadow-black rounded-lg">
   {chainId && chainId === SEPOLIA_ETH_CHAINID ? <>
    <SelectItem value={SEPOLIA_ETH_WETH_ADDR}> <FaEthereum className="text-zinc-500"/>Wrapped Ethereum (WETH)</SelectItem>
    <SelectItem value={SEPOLIA_ETH_WBTC_ADDR}><FaBitcoin className="text-orange-500"/>Wrapped Bitcoin (WBTC)</SelectItem>
    <SelectItem value={SEPOLIA_ETH_LINK_ADDR}><SiChainlink className="text-blue-500" />Chainlink (LINK)</SelectItem>
    </> : chainId && chainId === BASE_SEPOLIA_CHAINID ? 
    <>
       <SelectItem value={
        BASE_SEPOLIA_WETH_ADDR
       }> <FaEthereum className="text-zinc-500"/>Wrapped Ethereum (WETH)</SelectItem>
    <SelectItem value={
      BASE_SEPOLIA_LINK_ADDR
    }><SiChainlink className="text-blue-500" />Chainlink (LINK)</SelectItem>
    </>
    :
    <>
     <SelectItem value={ARBITRUM_SEPOLIA_LINK_ADDR}><SiChainlink className="text-blue-500" />Chainlink (LINK)</SelectItem>
    </>}
  </SelectContent>
</Select>
</div>


</div>
{stabilskiBalances as unknown as singleResultType<bigint>[] && arrayOfContracts.findIndex((contract) => contract.chainId === chainId) !== -1 && <div className='self-end text-sm flex items-center gap-1'>
    <Label>Available PLST</Label>
    <p className='text-red-500 font-bold'>{maximumAmount - amount}</p>
  </div>}


<div className="flex w-full flex-wrap items-center justify-center gap-2">
  <Button onClick={()=>{
  writeContract({
    'abi':stabilskiTokenABI,
    'address':chainId === SEPOLIA_ETH_CHAINID ? stabilskiTokenEthSepoliaAddress : stabilskiTokenArbitrumSepoliaAddress,
    'functionName':'approve',
    'args':[chainId === SEPOLIA_ETH_CHAINID ? ethSepoliaVaultManagerAddress : arbitrumSepoliaVaultManagerAddress, amount * 
      (token === SEPOLIA_ETH_WBTC_ADDR ? 1e8 : 1e18)
    ],
    chainId
  });
}} className={`bg-blue-500 max-w-40 w-full cursor-pointer hover:bg-blue-800 hover:scale-95`}>Approve PLST</Button>

<Button onClick={()=>{
  writeContract({
    'abi':vaultManagerAbi,
    'address':chainId === SEPOLIA_ETH_CHAINID ? ethSepoliaVaultManagerAddress : arbitrumSepoliaVaultManagerAddress,
    'functionName':'repayPLST',
    'args':[token],
    chainId
  });
}} className={`bg-green-500 max-w-40 w-full cursor-pointer hover:bg-green-800 hover:scale-95`}>Repay</Button>
</div>

  </DialogContent>
</Dialog>
  )
}

export default RepayDialog