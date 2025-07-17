/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {  useState } from 'react'
import { Button } from '../ui/button'
import { DialogHeader,Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { useAccount,  useReadContracts, useWriteContract } from 'wagmi';
import { SEPOLIA_ETH_WETH_ADDR, SEPOLIA_ETH_WBTC_ADDR, SEPOLIA_ETH_LINK_ADDR, ARBITRUM_SEPOLIA_CHAINID, ARBITRUM_SEPOLIA_LINK_ADDR, SEPOLIA_ETH_CHAINID } from '@/lib/CollateralContractAddresses';
import { FaEthereum, FaBitcoin } from 'react-icons/fa6';
import { SiChainlink } from 'react-icons/si';
import { Label } from '../ui/label';
import { stabilskiTokenABI, stabilskiTokenArbitrumSepoliaAddress, stabilskiTokenEthSepoliaAddress } from '@/lib/smart-contracts-abi/StabilskiToken';
import { arbitrumSepoliaVaultManagerAddress, ethSepoliaVaultManagerAddress, vaultManagerAbi } from '@/lib/smart-contracts-abi/VaultManager';



function RepayDialog() {
 const [amount, setAmount] = useState<number>(0);
  const [token, setToken] = useState<`0x${string}` | undefined>(undefined);
  const [maximumAmount, setMaximumAmount] = useState<number>(0);
const { address, chainId }=useAccount();
 // eslint-disable-next-line react-hooks/exhaustive-deps
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
    ]
  }
  );

const {writeContract}=useWriteContract({
  'mutation':{
    'onSuccess':(data)=>{
      console.log(data);
    }
  }
});

  return (
   <Dialog>
  <DialogTrigger>
 <Button  className={`bg-blue-500 cursor-pointer hover:bg-blue-800 hover:scale-95`}>Repay</Button>
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
console.log(vaultInfoContracts.findIndex((info)=>info.args[1] === value));
  console.log(((vaultInfo as unknown as any[])[vaultInfoContracts.findIndex((info)=>info.args[1] === value)].result));

  if(value  && vaultInfoContracts.findIndex((info)=>info.args[1] === value) !== -1  && (vaultInfo as unknown as any[]) && ((vaultInfo as unknown as any[])[vaultInfoContracts.findIndex((info)=>info.args[1] === value)].result)) {
    setMaximumAmount(Number((vaultInfo as unknown as any[])[vaultInfoContracts.findIndex((info)=>info.args[1] === value)].result[1]) / 1e18);
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
    </> :
    <>
     <SelectItem value={ARBITRUM_SEPOLIA_LINK_ADDR}><SiChainlink className="text-blue-500" />Chainlink (LINK)</SelectItem>
    </>}
  </SelectContent>
</Select>
</div>


</div>
{stabilskiBalances as unknown as any[] && arrayOfContracts.findIndex((contract) => contract.chainId === chainId) !== -1 && <div className='self-end text-sm flex items-center gap-1'>
    <Label>Available PLST</Label>
    <p className='text-red-500 font-bold'>{maximumAmount - amount}</p>
  </div>}


<div className="flex items-center justify-center gap-2">
  <Button onClick={()=>{
  writeContract({
    'abi':stabilskiTokenABI,
    'address':chainId === SEPOLIA_ETH_CHAINID ? stabilskiTokenEthSepoliaAddress : stabilskiTokenArbitrumSepoliaAddress,
    'functionName':'approve',
    'args':[chainId === SEPOLIA_ETH_CHAINID ? ethSepoliaVaultManagerAddress : arbitrumSepoliaVaultManagerAddress
       , amount * 1e18],
    chainId
  });
}} className={`bg-blue-500 max-w-4/5 w-full cursor-pointer hover:bg-blue-800 hover:scale-95`}>Approve PLST</Button>

<Button onClick={()=>{
  writeContract({
    'abi':vaultManagerAbi,
    'address':chainId === SEPOLIA_ETH_CHAINID ? ethSepoliaVaultManagerAddress : arbitrumSepoliaVaultManagerAddress,
    'functionName':'repayPLST',
    'args':[SEPOLIA_ETH_WETH_ADDR
      , amount * 1e18],
    chainId
  });
}} className={`bg-green-500 max-w-4/5 w-full cursor-pointer hover:bg-green-800 hover:scale-95`}>Repay</Button>
</div>

  </DialogContent>
</Dialog>
  )
}

export default RepayDialog