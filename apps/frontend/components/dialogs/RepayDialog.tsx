import React, { useCallback, useState } from 'react'
import { Button } from '../ui/button'
import { DialogHeader,Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { useAccount, useReadContracts } from 'wagmi';
import { SEPOLIA_ETH_WETH_ADDR, SEPOLIA_ETH_WBTC_ADDR, SEPOLIA_ETH_LINK_ADDR, ARBITRUM_SEPOLIA_CHAINID, ARBITRUM_SEPOLIA_LINK_ADDR, SEPOLIA_ETH_CHAINID, ARBITRUM_SEPOLIA_ABI, SEPOLIA_ETH_WBTC_ABI, SEPOLIA_ETH_WETH_ABI, SEPOLIA_ETH_LINK_ABI } from '@/lib/CollateralContractAddresses';
import { FaEthereum, FaBitcoin } from 'react-icons/fa6';
import { SiChainlink } from 'react-icons/si';
import { arbitrumSepoliaVaultManagerAddress, ethSepoliaVaultManagerAddress, vaultManagerAbi } from '@/smart-contracts-abi/VaultManager';



function RepayDialog() {
 const [amount, setAmount] = useState<number>(0);
  const [token, setToken] = useState<`0x${string}` | undefined>(undefined);
  const [maximumAmount, setMaximumAmount] = useState<number>(0);
const {address}=useAccount();
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
    ]

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
      })
    const getTheMaxAmountOfTokensToBorrow= useCallback(()=>{

      if(!maxBorrowableData && !token) return 0

      if(!(maxBorrowableData as unknown as any)[arrayOfContracts.findIndex((contract) => contract.address === token)]){
        return 0
      }

      const collateralMaxBorrowable = (maxBorrowableData as unknown as any)[arrayOfContracts.findIndex((contract) => contract.address === token)]?.result ?? 0;
     

      return Number(collateralMaxBorrowable as unknown as bigint) / 10 ** 18;
 


},[maxBorrowableData, arrayOfContracts, token]);

    const {chainId}=useAccount();

  return (
   <Dialog>
  <DialogTrigger>
 <Button  className={`bg-blue-500 cursor-pointer hover:bg-blue-800 hover:scale-95`} >Repay</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Repay Your Debt</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </DialogDescription>
    </DialogHeader>

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

  </DialogContent>
</Dialog>
  )
}

export default RepayDialog