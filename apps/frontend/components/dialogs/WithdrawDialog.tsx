'use client';


import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog'
import React, { useState } from 'react'
import { DialogHeader } from '../ui/dialog'
import { Button } from '../ui/button'
import {  useAccount, useReadContracts, useWriteContract } from 'wagmi';
import { arbitrumSepoliaVaultManagerAddress, baseSepoliaVaultManagerAddress, ethSepoliaVaultManagerAddress, vaultManagerAbi } from '@/lib/smart-contracts-abi/VaultManager';
import { ARBITRUM_SEPOLIA_CHAINID, ARBITRUM_SEPOLIA_LINK_ADDR, BASE_SEPOLIA_CHAINID, BASE_SEPOLIA_LINK_ADDR, BASE_SEPOLIA_WETH_ADDR, SEPOLIA_ETH_CHAINID, SEPOLIA_ETH_LINK_ADDR, SEPOLIA_ETH_WBTC_ADDR, SEPOLIA_ETH_WETH_ADDR } from '@/lib/CollateralContractAddresses';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SiChainlink } from 'react-icons/si';
import { FaBitcoin, FaEthereum } from 'react-icons/fa6';
import { stabilskiTokenBaseSepoliaCollateralManagerAddress, stabilskiTokenCollateralManagerAbi, stabilskiTokenSepoliaEthCollateralManagerAddress } from '@/lib/smart-contracts-abi/CollateralManager';


function WithdrawDialog() {
  const {chainId, address}=useAccount();
  const [amount, setAmount] = useState<number>(0);
  const [token, setToken] = useState<`0x${string}` | undefined>(undefined);
  const [maximumAmount, setMaximumAmount] = useState<number>(0);

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
    const {data:vaultInfo}=useReadContracts(
  {
    contracts:vaultInfoContracts as any
  }
  );

  const {data:collateralInfos}=useReadContracts({
    contracts:[
      {
        'abi':stabilskiTokenCollateralManagerAbi,
        'address':stabilskiTokenSepoliaEthCollateralManagerAddress,
        'functionName':'getCollateralInfo',
        'args':[SEPOLIA_ETH_WETH_ADDR],
        chainId:SEPOLIA_ETH_CHAINID,
      },
         {
        'abi':stabilskiTokenCollateralManagerAbi,
        'address':stabilskiTokenSepoliaEthCollateralManagerAddress,
        'functionName':'getCollateralInfo',
        'args':[SEPOLIA_ETH_WBTC_ADDR],
        chainId:SEPOLIA_ETH_CHAINID,
      },
         {
        'abi':stabilskiTokenCollateralManagerAbi,
        'address':stabilskiTokenSepoliaEthCollateralManagerAddress,
        'functionName':'getCollateralInfo',
        'args':[SEPOLIA_ETH_LINK_ADDR],
        chainId:SEPOLIA_ETH_CHAINID,
      },
         {
        'abi':stabilskiTokenCollateralManagerAbi,
        'address':stabilskiTokenBaseSepoliaCollateralManagerAddress,
        'functionName':'getCollateralInfo',
        'args':[BASE_SEPOLIA_LINK_ADDR],
        chainId:BASE_SEPOLIA_CHAINID
      },
         {
        'abi':stabilskiTokenCollateralManagerAbi,
        'address':stabilskiTokenBaseSepoliaCollateralManagerAddress,
        'functionName':'getCollateralInfo',
        'args':[BASE_SEPOLIA_WETH_ADDR],
        chainId:BASE_SEPOLIA_CHAINID
      },
      
      
    ]
  });

  const {writeContract}=useWriteContract({
    'mutation':{
      'onSuccess':(data)=>{
        console.log(data);
      }
    }
  });


return (
<Dialog>
  <DialogTrigger className={`bg-red-500 cursor-pointer transition-all rounded-md text-sm text-white p-2   hover:bg-red-800 hover:scale-95`} >
    Withdraw
  </DialogTrigger>
  <DialogContent className='flex flex-col gap-4 w-full'>
    <DialogHeader>
      <DialogTitle>Withdraw Your Collateral</DialogTitle>
      <DialogDescription>
        You can commit a withdrawal of your collateral.
      </DialogDescription>
    </DialogHeader>


<div className="flex items-center gap-2 w-full">
  <div className="w-full flex flex-col gap-1">
    <Label>Amount</Label>
    <Input value={amount} onChange={(e) =>setAmount(Number(e.target.value))} type="number" min={0} 
   step={0.00001}
    max={maximumAmount}
    className="w-full"/>
  </div>
<div className="max-w-24 w-full flex flex-col gap-1">
  <Label>Vault</Label>
   <Select onValueChange={(value)=>{
  setToken(value as `0x${string}`);
  // const collaterizationRatio =collateralInfos as unknown as any[] && Number((collateralInfos as unknown as any[])[vaultInfoContracts.findIndex((info)=>info.args[1] === value)].result[1]) / 1e18;
  const collateralValue =collateralInfos as unknown as any[] && Number((vaultInfo as unknown as any[])[vaultInfoContracts.findIndex((info)=>info.args[1] === value)].result[0]) / (value === SEPOLIA_ETH_WBTC_ADDR ? 1e8 : 1e18);

  const maxWithdrawAmount =(Number(collateralValue));

  setMaximumAmount(maxWithdrawAmount)

  // if(value  && maxWithdrawAmount){
  //   setMaximumAmount(maxWithdrawAmount);
  // }

 }}>
  <SelectTrigger className="max-w-24">
    <SelectValue placeholder="Vault" />
  </SelectTrigger>
  <SelectContent className="max-w-64 w-full bg-white shadow-md backdrop-blur-2xl shadow-black border-red-500 border-2  rounded-lg relative top-0 left-0 before:content-[''] before:absolute before:left-0 before:bottom-0 before:w-full before:h-1/2 before:rounded-t-full before:blur-2xl before:bg-red-500">
   {chainId && chainId === SEPOLIA_ETH_CHAINID ? <>
    <SelectItem value={SEPOLIA_ETH_WETH_ADDR}> <FaEthereum className="text-zinc-500"/>Wrapped Ethereum (WETH)</SelectItem>
    <SelectItem value={SEPOLIA_ETH_WBTC_ADDR}><FaBitcoin className="text-orange-500"/>Wrapped Bitcoin (WBTC)</SelectItem>
    <SelectItem value={SEPOLIA_ETH_LINK_ADDR}><SiChainlink className="text-blue-500" />Chainlink (LINK)</SelectItem>
    </> :
    <>
     <SelectItem value={ARBITRUM_SEPOLIA_LINK_ADDR}><SiChainlink className="text-blue-500" />Chainlink (LINK)</SelectItem>
    </>}
  </SelectContent>
</Select>
</div>



</div>
<Button onClick={()=>{

writeContract({
  abi:vaultManagerAbi,
  args:[token, amount * (token === SEPOLIA_ETH_WBTC_ADDR ? 1e8 : 1e18)],
  functionName:'withdrawCollateral',
  address: chainId === SEPOLIA_ETH_CHAINID ? ethSepoliaVaultManagerAddress : arbitrumSepoliaVaultManagerAddress,
  chainId
});
}} className='bg-red-500 hover:bg-red-800 hover:scale-95 cursor-pointer max-w-2/3 w-full self-center'>Withdraw</Button>


  </DialogContent>
</Dialog>
  )
}

export default WithdrawDialog