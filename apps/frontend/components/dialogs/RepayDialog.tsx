'use client';

import React, {  useState } from 'react'
import { Button } from '../ui/button'
import { DialogHeader,Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { useAccount,  useAccountEffect,  useReadContract,  useReadContracts, useWatchContractEvent, useWriteContract } from 'wagmi';
import { SEPOLIA_ETH_WETH_ADDR, SEPOLIA_ETH_WBTC_ADDR, SEPOLIA_ETH_LINK_ADDR, ARBITRUM_SEPOLIA_CHAINID, ARBITRUM_SEPOLIA_LINK_ADDR, SEPOLIA_ETH_CHAINID, BASE_SEPOLIA_CHAINID, BASE_SEPOLIA_LINK_ADDR, BASE_SEPOLIA_WETH_ADDR } from '@/lib/CollateralContractAddresses';
import { FaEthereum, FaBitcoin } from 'react-icons/fa6';
import { SiChainlink } from 'react-icons/si';
import { Label } from '../ui/label';
import { stabilskiTokenABI } from '@/lib/smart-contracts-abi/StabilskiToken';
import { arbitrumSepoliaVaultManagerAddress, baseSepoliaVaultManagerAddress, ethSepoliaVaultManagerAddress, vaultManagerAbi } from '@/lib/smart-contracts-abi/VaultManager';
import { ApprovalInterface, CollateralDeposited, ethereumAddress, EventType, singleResultType, vaultInfoReturnType } from '@/lib/types/onChainData/OnChainDataTypes';
import useBlockchainData from '@/lib/hooks/useBlockchainData';
import useToastContent from '@/lib/hooks/useToastContent';




function RepayDialog({vaultManagerAddress}:{vaultManagerAddress:ethereumAddress}) {
 const [amount, setAmount] = useState<number>(0);
  const [token, setToken] = useState<`0x${string}` | undefined>(undefined);
  const [approved, setApproved]=useState<boolean>(false);
  const [maximumAmount, setMaximumAmount] = useState<number>(0);
const { address, chainId }=useAccount();

const {currentChainVaultManagerAddress, currentStabilskiContractAddress}=useBlockchainData();

const {sendToastContent}=useToastContent();

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

    const {data:stabilskiBalance}=useReadContract({
         'abi':stabilskiTokenABI,
        'address':currentStabilskiContractAddress as ethereumAddress,
        'functionName':'balanceOf',
        'args':[address],
        chainId
    });

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
      chainId:BASE_SEPOLIA_CHAINID
    },

    ]
  }
  );

const {writeContract}=useWriteContract({
  mutation:{
    onError:(error)=>{
      sendToastContent({
        toastText: error.message,
        icon: '❌',
        type: 'error'
      });
    }
  }
});


const approvePLST =()=>{
  writeContract({
    'abi':stabilskiTokenABI,
    'address':currentStabilskiContractAddress as ethereumAddress,
    'functionName':'approve',
    'args':[currentChainVaultManagerAddress, (amount * 
      (token === SEPOLIA_ETH_WBTC_ADDR ? 1e8 : 1e18))
    ],
    chainId
  });
}

const repayDebtInPLST=()=>{
  writeContract({
    'abi':vaultManagerAbi,
    'address':currentChainVaultManagerAddress as ethereumAddress,
    'functionName':'repayPLST',
    'args':[token],
    chainId
  });
}

useAccountEffect({onDisconnect() {
  setToken(undefined);
setApproved(false);
setAmount(0);
setMaximumAmount(0);
}});

    useWatchContractEvent({
  address: vaultManagerAddress,
  abi: vaultManagerAbi,
  eventName: 'DebtRepaid',
  onLogs: (logs) => {
const eventLogs= logs.sort((a, b)=> Number(b.blockNumber) - Number(a.blockNumber)) as EventType<CollateralDeposited>[];
    sendToastContent({toastText:`
    🎉 Debt Repaid: ${ (Number(eventLogs[0].args?.amount as bigint)/1e18).toFixed(2)} PLST by ${eventLogs[0].args?.vaultOwner.slice(0,6)}...
    `, icon:'✅', type:'success'
});
setToken(undefined);
setApproved(false);
setAmount(0);
setMaximumAmount(0);
  },
  args:{
    vaultOwner: address,
    token: currentStabilskiContractAddress,
  },

});

  useWatchContractEvent({
    address: currentStabilskiContractAddress as ethereumAddress,
    abi: stabilskiTokenABI,
    eventName: 'Approval',
  'onLogs':(logs)=>{
    console.log('New logs!', logs[0] as EventType<ApprovalInterface>);
    setApproved(true);
    sendToastContent({toastText:`Stabilski Tokens Approved Successfully (${
     ( Number((logs[0] as EventType<ApprovalInterface>).args?.value) / 1e18).toFixed(3)
      }) PLST`,
    icon:'✅',
    type:'success'
  });
  },
  args:{
    owner: address,
  },
   'strict':true,
  });



  return (
   <Dialog>
  <DialogTrigger className={`bg-blue-500 cursor-pointer hover:bg-blue-800 hover:scale-95 p-2 text-white text-sm transition-all rounded-md`}>
 Repay
  </DialogTrigger>
  <DialogContent className='flex flex-col bg-neutral-800 border-red-500 text-white gap-4 items-center w-full '>
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
    console.log(value);
  setToken(value as `0x${string}`);
  if(value  && vaultInfoContracts.findIndex((info)=>info.args[1] === value) !== -1  && (vaultInfo as unknown as vaultInfoReturnType) && ((vaultInfo as unknown as vaultInfoReturnType)[vaultInfoContracts.findIndex((info)=>info.args[1] === value)])) {
const indexOfTheContract=vaultInfoContracts.findIndex((info)=>info.args[1] === value);
console.log(indexOfTheContract,Number(((vaultInfo as unknown as vaultInfoReturnType)[indexOfTheContract] as unknown as singleResultType<vaultInfoReturnType>).result[1]));

setMaximumAmount(Number(((vaultInfo as unknown as vaultInfoReturnType)[indexOfTheContract] as unknown as singleResultType<vaultInfoReturnType>).result[1]) / 1e18);
  }

 }}>
  <SelectTrigger className="max-w-24">
    <SelectValue placeholder="Vault" />
  </SelectTrigger>
  <SelectContent className="max-w-64 w-full border-red-500 bg-neutral-800 shadow-sm shadow-black rounded-lg">
   {chainId && chainId === SEPOLIA_ETH_CHAINID ? <>
    <SelectItem className='focus:bg-neutral-600 focus:text-white text-white' value={SEPOLIA_ETH_WETH_ADDR}> <FaEthereum className="text-zinc-500"/>Wrapped Ethereum (WETH)</SelectItem>
    <SelectItem className='focus:bg-neutral-600 focus:text-white text-white' value={SEPOLIA_ETH_WBTC_ADDR}><FaBitcoin className="text-orange-500"/>Wrapped Bitcoin (WBTC)</SelectItem>
    <SelectItem className='focus:bg-neutral-600 focus:text-white text-white' value={SEPOLIA_ETH_LINK_ADDR}><SiChainlink className="text-blue-500" />Chainlink (LINK)</SelectItem>
    </> : chainId && chainId === BASE_SEPOLIA_CHAINID ? 
    <>
       <SelectItem className='focus:bg-neutral-600 focus:text-white text-white' value={
        BASE_SEPOLIA_WETH_ADDR
       }> <FaEthereum className="text-zinc-500"/>Wrapped Ethereum (WETH)</SelectItem>
    <SelectItem className='focus:bg-neutral-600 focus:text-white text-white' value={
      BASE_SEPOLIA_LINK_ADDR
    }><SiChainlink className="text-blue-500" />Chainlink (LINK)</SelectItem>
    </>
    :
    <>
     <SelectItem className='focus:bg-neutral-600 focus:text-white text-white' value={ARBITRUM_SEPOLIA_LINK_ADDR}><SiChainlink className="text-blue-500" />Chainlink (LINK)</SelectItem>
    </>}
  </SelectContent>
</Select>
</div>


</div>
{stabilskiBalance as unknown as bigint &&<div className='flex items-center gap-6 self-end'>

   <div className='self-end text-sm flex items-center gap-2'>
    <Label>Balance</Label>
    <p className='text-red-500 font-semibold'>{(Number(stabilskiBalance)/1e18).toFixed(2)} PLST</p>
  </div>

 <div className='self-end text-sm flex items-center gap-2'>
    <Label>Debt</Label>
    <p className='text-red-500 font-bold'>{(maximumAmount - amount).toFixed(2)} PLST</p>
  </div>  
  </div>}


<div className="flex w-full flex-wrap items-center justify-center gap-2">
  <Button disabled={approved} onClick={approvePLST} className={`bg-blue-500 disabled:bg-blue-950 max-w-40 w-full cursor-pointer hover:bg-blue-800 hover:scale-95`}>Approve PLST</Button>

<Button disabled={!approved} onClick={repayDebtInPLST} className={`bg-green-500 disabled:bg-green-950 max-w-40 w-full cursor-pointer hover:bg-green-800 hover:scale-95`}>Repay</Button>
</div>

  </DialogContent>
</Dialog>
  )
}

export default RepayDialog