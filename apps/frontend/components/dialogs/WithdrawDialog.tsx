'use client';


import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog'
import React, { useState } from 'react'
import { DialogHeader } from '../ui/dialog'
import { Button } from '../ui/button'
import {  useAccount, useReadContract, useReadContracts, useWatchContractEvent, useWriteContract } from 'wagmi';
import { arbitrumSepoliaVaultManagerAddress, baseSepoliaVaultManagerAddress, ethSepoliaVaultManagerAddress, vaultManagerAbi } from '@/lib/smart-contracts-abi/VaultManager';
import { ARBITRUM_SEPOLIA_CHAINID, ARBITRUM_SEPOLIA_LINK_ADDR, BASE_SEPOLIA_CHAINID, BASE_SEPOLIA_LINK_ADDR, BASE_SEPOLIA_WETH_ADDR, SEPOLIA_ETH_CHAINID, SEPOLIA_ETH_LINK_ADDR, SEPOLIA_ETH_WBTC_ADDR, SEPOLIA_ETH_WETH_ADDR } from '@/lib/CollateralContractAddresses';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SiChainlink } from 'react-icons/si';
import { FaBitcoin, FaEthereum } from 'react-icons/fa6';
import { CollateralDeposited, collateralInfoType, ethereumAddress, EventType, singleResultType, vaultInfoReturnType } from '@/lib/types/onChainData/OnChainDataTypes';
import { Abi } from 'viem';
import useBlockchainData from '@/lib/hooks/useBlockchainData';
import useToastContent from '@/lib/hooks/useToastContent';
import usePreventInvalidInput from '@/lib/hooks/usePreventInvalidInput';
import { stabilskiTokenBaseSepoliaCollateralManagerAddress, stabilskiTokenCollateralManagerAbi, stabilskiTokenSepoliaEthCollateralManagerAddress } from '@/lib/smart-contracts-abi/CollateralManager';
import { stabilskiTokenArbitrumSepoliaAddress } from '@/lib/smart-contracts-abi/StabilskiToken';


function WithdrawDialog() {
  const {chainId, address}=useAccount();
  const [amount, setAmount] = useState<number>(0);
  const [token, setToken] = useState<`0x${string}` | undefined>(undefined);
  const [maximumAmount, setMaximumAmount] = useState<number>(0);

  const {handleBlur, handleChange, handleKeyDown, handlePaste}=usePreventInvalidInput();
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
    contracts:vaultInfoContracts as readonly {
    abi?: Abi | undefined;
    functionName?: string | undefined;
    args?: readonly unknown[] | undefined;
    address?: ethereumAddress | undefined;
    chainId?: number | undefined;
}[]
  }
  );

  
  const {
    currentChainVaultManagerAddress,
  
  }=useBlockchainData();


  const {isLoading, data}=useReadContract({
    'abi':vaultManagerAbi,
    'address':currentChainVaultManagerAddress as ethereumAddress,
    'functionName':'getIsHealthyAfterWithdrawal',
    'args':[BigInt(amount * 1e18), token as ethereumAddress],
    chainId,
    query:{
      enabled: amount > 0 && token && token.length === 42
    }
  });

    const {isLoading:healthFactorLoading, data:healthFactor}=useReadContract({
    'abi':vaultManagerAbi,
    'address':currentChainVaultManagerAddress as ethereumAddress,
    'functionName':'getIsHealthyAfterWithdrawal',
    'args':[address, token as ethereumAddress],
    chainId,
    query:{
      enabled: address && token && token.length === 42
    }
  });

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
        'address':stabilskiTokenArbitrumSepoliaAddress,
        'functionName':'getCollateralInfo',
        'args':[ARBITRUM_SEPOLIA_LINK_ADDR],
        chainId:ARBITRUM_SEPOLIA_CHAINID,
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
      },
      
    }
  });

  const {sendToastContent}=useToastContent();

  const withdrawCollateral= async ()=>{
writeContract({
  abi:vaultManagerAbi,
  args:[token, amount * (token === SEPOLIA_ETH_WBTC_ADDR ? 1e8 : 1e18)],
  functionName:'withdrawCollateral',
  address: currentChainVaultManagerAddress as ethereumAddress,
  chainId
});
}


      useWatchContractEvent({
          address:currentChainVaultManagerAddress as ethereumAddress,
          abi:vaultManagerAbi,
          eventName:'CollateralWithdrawn',
          'args':{
              owner:address,
              spender: currentChainVaultManagerAddress
          },
          onLogs:(logs)=>{
            const eventLog = logs[0] as EventType<CollateralDeposited>;

          sendToastContent({
            toastText:`Collateral successfully withdrawn  ${
          ( Number(
          eventLog.args?.amount
           ) / (eventLog.args?.token !== SEPOLIA_ETH_WBTC_ADDR ? 1e18 : 1e8)).toFixed(4)} ${eventLog.args?.token === SEPOLIA_ETH_WBTC_ADDR ? 'WBTC' : eventLog.args?.token === SEPOLIA_ETH_WETH_ADDR ? 'WETH' : eventLog.args?.token === SEPOLIA_ETH_LINK_ADDR ? 'LINK' : eventLog.args?.token === BASE_SEPOLIA_WETH_ADDR ? 'WETH' : 'LINK'  
           }`,
            icon:'✅',
            type:'success'
          });
          }
      })
  



return (
<Dialog>
  <DialogTrigger className={`bg-red-500 cursor-pointer transition-all rounded-md text-sm text-white p-2  hover:bg-red-800 hover:scale-95`} >
    Withdraw
  </DialogTrigger>
  <DialogContent className='flex border-red-500 h-80 justify-between bg-neutral-800 text-white flex-col gap-4 w-full'>
    <DialogHeader>
      <DialogTitle>Withdraw Your Collateral</DialogTitle>
      <DialogDescription>
        You can commit a withdrawal of your collateral.
      </DialogDescription>
    </DialogHeader>


<div className="flex flex-col sm:flex-row items-center gap-2 w-full">
  <div className="w-full flex flex-col gap-1">
    <Label>Amount</Label>
    <Input onKeyDown={handleKeyDown} onPaste={handlePaste} onBlur={(e)=>handleBlur(e.target.value, setAmount)} value={amount} onChange={(e) =>handleChange(e, setAmount)} type="number" min={0} 
   step={0.001}
    max={maximumAmount}
    className="w-full max-w-xs"/>
  </div>
<div className="sm:max-w-24 w-full flex flex-col gap-1">
  <Label>Vault</Label>
   <Select onValueChange={(value)=>{
  setToken(value as `0x${string}`);
  const collateralValue =collateralInfos as unknown as collateralInfoType
   && Number((vaultInfo as unknown as singleResultType<vaultInfoReturnType>[])[vaultInfoContracts.findIndex((info)=>info.args[1] === value)].result[0]) / (value === SEPOLIA_ETH_WBTC_ADDR ? 1e8 : 1e18);

  const maxWithdrawAmount =(Number(collateralValue));

  setMaximumAmount(maxWithdrawAmount);

 }}>
  <SelectTrigger className="sm:max-w-24 max-w-xs w-full">
    <SelectValue placeholder="Vault" />
  </SelectTrigger>
  <SelectContent className="max-w-64 w-full bg-neutral-800 shadow-md backdrop-blur-2xl shadow-black border-red-500 border-2 rounded-lg relative top-0 left-0 before:content-[''] before:absolute before:left-0 before:bottom-0 before:w-full before:h-1/2 before:rounded-t-full before:blur-2xl before:bg-red-500">
   {chainId && chainId === SEPOLIA_ETH_CHAINID ? <>
    <SelectItem className='text-white' value={SEPOLIA_ETH_WETH_ADDR}> <FaEthereum className="text-zinc-500"/>Wrapped Ethereum (WETH)</SelectItem>
    <SelectItem className='text-white' value={SEPOLIA_ETH_WBTC_ADDR}><FaBitcoin className="text-orange-500"/>Wrapped Bitcoin (WBTC)</SelectItem>
    <SelectItem className='text-white' value={SEPOLIA_ETH_LINK_ADDR}><SiChainlink className="text-blue-500" />Chainlink (LINK)</SelectItem>
    </> : chainId && chainId === BASE_SEPOLIA_CHAINID ? 
        <>
           <SelectItem className='text-white' value={
            BASE_SEPOLIA_WETH_ADDR
           }> <FaEthereum className="text-zinc-500"/>Wrapped Ethereum (WETH)</SelectItem>
        <SelectItem className='text-white' value={
          BASE_SEPOLIA_LINK_ADDR
        }><SiChainlink className="text-blue-500" />Chainlink (LINK)</SelectItem>
        </>
        :
        <>
         <SelectItem className='text-white' value={ARBITRUM_SEPOLIA_LINK_ADDR}><SiChainlink className="text-blue-500" />Chainlink (LINK)</SelectItem>
        </>}
  </SelectContent>
</Select>
</div>


{healthFactor as bigint && <p>{Number(healthFactor)}</p>}
{data as boolean && <p className='text-green-600 italic text-sm'>After withdrawal, your vault will not remain healthy.</p>}

</div>

<p>{JSON.stringify(data)}</p>

<Button disabled={data as boolean ?? false} onClick={
  withdrawCollateral
} className='bg-red-500 disabled:bg-red-900 hover:bg-red-800 hover:scale-95 cursor-pointer max-w-2/3 w-full self-center'>Withdraw</Button>


  </DialogContent>
</Dialog>
  )
}

export default WithdrawDialog