'use client';
import React, { useCallback, useMemo, useState } from 'react'
import { TabsContent } from '../ui/tabs'
import { Label } from '../ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select'
import { FaEthereum, FaBitcoin } from 'react-icons/fa6'
import { SiChainlink } from 'react-icons/si'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { useAccount, useReadContract, useReadContracts, useSwitchChain, useWatchContractEvent, useWriteContract } from 'wagmi'
import { usdplnOracleABI } from '@/lib/smart-contracts-abi/USDPLNOracle';
import { ARBITRUM_SEPOLIA_ABI, ARBITRUM_SEPOLIA_CHAINID, ARBITRUM_SEPOLIA_LINK_ADDR, BASE_SEPOLIA_CHAINID, BASE_SEPOLIA_LINK_ABI, BASE_SEPOLIA_LINK_ADDR, BASE_SEPOLIA_WETH_ABI, BASE_SEPOLIA_WETH_ADDR, SEPOLIA_ETH_CHAINID, SEPOLIA_ETH_LINK_ABI, SEPOLIA_ETH_LINK_ADDR, SEPOLIA_ETH_WBTC_ABI, SEPOLIA_ETH_WBTC_ADDR, SEPOLIA_ETH_WETH_ABI, SEPOLIA_ETH_WETH_ADDR } from '@/lib/CollateralContractAddresses';
import { vaultManagerAbi } from '@/lib/smart-contracts-abi/VaultManager';
import { stabilskiTokenArbitrumSepoliaCollateralManagerAddress, stabilskiTokenBaseSepoliaCollateralManagerAddress, stabilskiTokenCollateralManagerAbi, stabilskiTokenSepoliaEthCollateralManagerAddress } from '@/lib/smart-contracts-abi/CollateralManager';
import { toast } from 'sonner';
import OnChainDataContainer from '../chain-data/OnChainDataContainer';
import useBlockchainData from '@/lib/hooks/useBlockchainData';
import { CollateralDeposited, ethereumAddress, EventType } from '@/lib/types/onChainData/OnChainDataTypes';
import usePreventInvalidInput from '@/lib/hooks/usePreventInvalidInput';


function ColltateralTab() {
    useSwitchChain({mutation:{
      onSuccess:(data)=>{
        console.log(data);
        setToken(undefined);
        setMaximumAmount(0);
        setAmount(0);
        setApproved(false);
      }
    }});

  const {handlePaste, handleKeyDown, handleBlur, handleChange}=usePreventInvalidInput();
  const [amount, setAmount] = useState<number>(0);
  const [token, setToken] = useState<`0x${string}` | undefined>(undefined);
  const [maximumAmount, setMaximumAmount] = useState<number>(0);
  const [approved, setApproved] = useState<boolean>(false);
    const {chainId, address}=useAccount();

    const {writeContract}=useWriteContract();

    const {getTokenAbi, currentChainVaultManagerAddress, currentOraclePriceAddress}=useBlockchainData();


    const currentAbi = getTokenAbi(token as `0x${string}`);

    const currentTokenArgs= token === BASE_SEPOLIA_WETH_ADDR || token === SEPOLIA_ETH_WETH_ADDR ? 
     {
    src:address,
    guy: currentChainVaultManagerAddress
  }
  :
  {
    owner:address,
    spender: currentChainVaultManagerAddress,
  }


    const arrayOfContracts=useMemo(()=>{
     return [
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
                abi:ARBITRUM_SEPOLIA_ABI,
                address:ARBITRUM_SEPOLIA_LINK_ADDR,
                functionName:'balanceOf',
                args:[address],
                chainId:ARBITRUM_SEPOLIA_CHAINID
     },
      {
        'abi':BASE_SEPOLIA_LINK_ABI,
        'address':BASE_SEPOLIA_LINK_ADDR,
        'functionName':'balanceOf',
        'args':[address],
        chainId:BASE_SEPOLIA_CHAINID
    },
    {
        'abi':BASE_SEPOLIA_WETH_ABI,
        'address':BASE_SEPOLIA_WETH_ADDR,
        'functionName':'balanceOf',
        'args':[address],
        chainId:BASE_SEPOLIA_CHAINID
    }
    ];
    }, [address]);
    

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
    },
     {
         'abi':ARBITRUM_SEPOLIA_ABI,
        'address':ARBITRUM_SEPOLIA_LINK_ADDR,
        'functionName':'balanceOf',
        'args':[address],
        chainId:ARBITRUM_SEPOLIA_CHAINID
    },
    {
        'abi':BASE_SEPOLIA_LINK_ABI,
        'address':BASE_SEPOLIA_LINK_ADDR,
        'functionName':'balanceOf',
        'args':[address],
        chainId:BASE_SEPOLIA_CHAINID
    },
    {
        'abi':BASE_SEPOLIA_WETH_ABI,
        'address':BASE_SEPOLIA_WETH_ADDR,
        'functionName':'balanceOf',
        'args':[address],
        chainId:BASE_SEPOLIA_CHAINID
    }
  
    ]});


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
    },
        {
              abi:stabilskiTokenCollateralManagerAbi,
              address:stabilskiTokenArbitrumSepoliaCollateralManagerAddress,
              functionName:'getTokenPrice',
              args:[ARBITRUM_SEPOLIA_LINK_ADDR],
              chainId:ARBITRUM_SEPOLIA_CHAINID
            },
      {
        abi:stabilskiTokenCollateralManagerAbi,
              address:stabilskiTokenBaseSepoliaCollateralManagerAddress,
              functionName:'getTokenPrice',
              args:[BASE_SEPOLIA_LINK_ADDR],
              chainId:BASE_SEPOLIA_CHAINID
      },
            {
        abi:stabilskiTokenCollateralManagerAbi,
              address:stabilskiTokenBaseSepoliaCollateralManagerAddress,
              functionName:'getTokenPrice',
              args:[BASE_SEPOLIA_WETH_ADDR],
              chainId:BASE_SEPOLIA_CHAINID
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
    },
    {
              abi:stabilskiTokenCollateralManagerAbi,
              address:stabilskiTokenArbitrumSepoliaCollateralManagerAddress,
              functionName:'getCollateralInfo',
              args:[address, ARBITRUM_SEPOLIA_LINK_ADDR],
              chainId:ARBITRUM_SEPOLIA_CHAINID
    },
       {
              abi:stabilskiTokenCollateralManagerAbi,
              address:stabilskiTokenArbitrumSepoliaCollateralManagerAddress,
              functionName:'getCollateralInfo',
              args:[address, BASE_SEPOLIA_LINK_ADDR],
              chainId:BASE_SEPOLIA_CHAINID
    },
     {
              abi:stabilskiTokenCollateralManagerAbi,
              address:stabilskiTokenArbitrumSepoliaCollateralManagerAddress,
              functionName:'getCollateralInfo',
              args:[address, BASE_SEPOLIA_WETH_ADDR],
              chainId:BASE_SEPOLIA_CHAINID
    }
    ]});


    const {data:usdplnOraclePrice}=useReadContract({
         'abi': usdplnOracleABI,
        'address':currentOraclePriceAddress as ethereumAddress,
        'functionName':'getPLNPrice',
        'args':[],
        chainId
    });


    const getTheMaxAmountOfTokensToBorrowBasedOnAmountAndToken= useCallback(()=>{
      if(!collateralTokenPriceData || !usdplnOraclePrice || !token || !collateralData) return 0;

      if(collateralData && collateralTokenPriceData && usdplnOraclePrice && token){
        
        const convertedNumber= Number(collateralTokenPriceData[arrayOfContracts.findIndex(c => c.address === token)].result);


        const main =((amount * convertedNumber) * Number(usdplnOraclePrice) * 1e18) / 1e22;
        
        const maxToBorrow = (main / 1e18);
        return (maxToBorrow / 1.4);
}

return 0;

},[collateralTokenPriceData, usdplnOraclePrice, token, collateralData, arrayOfContracts, amount]);


const TokensOptions = ()=>{
 switch(chainId){
    case SEPOLIA_ETH_CHAINID:
      return(<>
 
        <SelectItem className="flex items-center gap-2 p-1" value={SEPOLIA_ETH_WETH_ADDR}> <FaEthereum className="text-zinc-500"/> <span className="text-sm">Wrapped Ethereum (WETH)</span></SelectItem>
    <SelectItem className="flex items-center gap-2 p-1"  value={SEPOLIA_ETH_WBTC_ADDR}><FaBitcoin className="text-orange-500"/> <span className="text-sm">Wrapped Bitcoin (WBTC)</span></SelectItem>
    <SelectItem className="flex items-center gap-2 p-1"  value={SEPOLIA_ETH_LINK_ADDR}><SiChainlink className="text-blue-500" /> <span className="text-sm">Chainlink (LINK)</span></SelectItem>

</>);

    case ARBITRUM_SEPOLIA_CHAINID:
      return (  <>
     <SelectItem className="flex items-center gap-2 p-1" value={ARBITRUM_SEPOLIA_LINK_ADDR}><SiChainlink className="text-blue-500" /> <span className="text-sm">Chainlink (LINK)</span></SelectItem>
    </>);

    case BASE_SEPOLIA_CHAINID:
      return (
  <>
    <SelectItem className="flex items-center gap-2 p-1"  value={BASE_SEPOLIA_WETH_ADDR}> <FaEthereum className="text-zinc-500"/> <span className="text-sm">Wrapped Ethereum (WETH)</span></SelectItem>
     <SelectItem className="flex items-center gap-2 p-1"  value={BASE_SEPOLIA_LINK_ADDR}><SiChainlink className="text-blue-500" />  <span className="text-sm">Chainlink (LINK)</span></SelectItem>
    </>

      );

    default:
      return (<></>)
    
  }


}

const CollateralTokensBalance=()=>{
switch(chainId){
case SEPOLIA_ETH_CHAINID:
  return (<>
  {data && 
<div className="flex flex-col gap-1 px-4">
  <div className="w-full flex sm:items-center flex-row  gap-3">
<div className='flex items-center gap-1'>
  <FaBitcoin className='text-orange-500'/> {(data[0] && Number(data[0].result) / 1e8).toFixed(2)}
</div>
<div className='flex items-center gap-1'><FaEthereum className='text-zinc-500'/> {(data[1] && Number(data[1].result) / 1e18).toFixed(2)}</div>
<div className='flex items-center gap-1'><SiChainlink className='text-blue-500'/> {data[2] && (Number(data[2].result) / 1e18).toFixed(2)}</div>
</div>
</div>}
  </>)

case ARBITRUM_SEPOLIA_CHAINID:
  return(<>{
    data && 
<div className="flex flex-col gap-1 px-4">
<div className='flex items-center gap-1'><SiChainlink className='text-blue-500'/> {data[3] && (Number(data[3].result) / 1e18).toFixed(2)}</div>
</div>
  }
  </>)
 
 case BASE_SEPOLIA_CHAINID:
  return (<>{data && <div className="flex items-center gap-2 px-4">
    <div className='flex items-center gap-1'><SiChainlink className='text-blue-500'/> {data[4] && (Number(data[4].result) / 1e18).toFixed(2)}</div>
        <div className='flex items-center gap-1'><FaEthereum className='text-blue-800'/> {data[5] && (Number(data[5].result) / 1e18).toFixed(2)}</div>
    </div>}</>)

}

}

const collaterlizePosition=()=>{
    writeContract({
    'abi':vaultManagerAbi,
    'address':currentChainVaultManagerAddress as ethereumAddress,
    'functionName':'depositCollateral',
    'args':[token],
  });
}

const approveCollateral=()=>{
if(token){
  console.log(arrayOfContracts.find(contract => contract.address === token));
    writeContract({
    'abi':arrayOfContracts.find(contract => contract.address === token)!.abi,
    'address':arrayOfContracts.find(contract => contract.address === token)!.address as ethereumAddress,
    'functionName':'approve',
    'args':[currentChainVaultManagerAddress, amount * 1e18],
  }, {
    onSettled(data, error) {
      if (error) {
        console.error('Error approving collateral:', error);
        toast.error(`Error approving collateral:${error.message}`);
      } else {
        console.log('Collateral approved successfully:', data);
        toast.loading('Approving collateral.....');
      }
    },
  })
}
}


useWatchContractEvent({
    address: token,
    abi: currentAbi,
    eventName: 'Approval',
  'onLogs':(logs)=>{
    console.log('New logs!', logs);
    setApproved(true);
    toast.success('Stabilski Tokens Approved Successfully');
  },
  args:currentTokenArgs
  });

  useWatchContractEvent({
    address: currentChainVaultManagerAddress as `0x${string}`,
    abi: vaultManagerAbi,
    eventName: 'CollateralDeposited',
  'onLogs':(logs)=>{
    const eventLog= logs[0] as EventType<CollateralDeposited>;
    toast.success(`Collateral successfully deposited ${
 ( Number(
 eventLog.args?.amount
  ) / (eventLog.args?.token !== SEPOLIA_ETH_WBTC_ADDR ? 1e18 : 1e8)).toFixed(4)} ${eventLog.args?.token === SEPOLIA_ETH_WBTC_ADDR ? 'WBTC' : eventLog.args?.token === SEPOLIA_ETH_WETH_ADDR ? 'WETH' : eventLog.args?.token === SEPOLIA_ETH_LINK_ADDR ? 'LINK' : eventLog.args?.token === BASE_SEPOLIA_WETH_ADDR ? 'WETH' : 'LINK'  
  }`);

  setApproved(false);
  setAmount(0);
  setMaximumAmount(0);
  setToken(undefined);
  },
  args:{
    vaultOwner: address,
    token: token,
  },
  'enabled': amount > 0 && token !== undefined && address !== undefined && chainId !== undefined,
  });


  return (
    <TabsContent value="collateral" className="flex flex-col gap-4 max-w-7xl w-full">

<Card className=" w-full max-w-lg self-center shadow-sm border-red-500 border shadow-black h-96">
  <div className="h-1/2 py-1 px-3 border-b border-red-500 flex gap-3 flex-col">
  <Label className="text-xl text-red-500">You Give</Label>
<div className="flex items-center gap-4">
  <Input step={0.01} value={amount} inputMode='decimal' 
   onPaste={handlePaste} 
  onKeyDown={handleKeyDown} 
  onBlur={(e)=>{handleBlur(e.target.value, setAmount)}}
  onChange={(e)=>handleChange(e, setAmount)} type="number" min={0} 
  max={maximumAmount}  className="w-full"/>
 <Select value={token} onValueChange={(value) => {
setToken(value as `0x${string}`);
if(data && data[arrayOfContracts.findIndex(contract => contract.address === value)].result){

  const maxToBorrow= Number(data[arrayOfContracts.findIndex(contract => contract.address === value)].result) / (value === SEPOLIA_ETH_WBTC_ADDR ? 1e8 : 1e18);
  console.log(maxToBorrow, 'maxToBorrow');
  setMaximumAmount(maxToBorrow);
}
}}>
  <SelectTrigger className="w-44">
    <SelectValue  placeholder="Token" />
  </SelectTrigger>
  <SelectContent className="w-64 relative flex flex-col gap-3 bg-white shadow-sm shadow-black rounded-lg">
<TokensOptions/>
  </SelectContent>
</Select>
</div>
  </div>
    <div className="h-1/2 py-1 px-3 flex gap-3 flex-col w-full">
  <Label className="text-lg text-zinc-700">You Will Be Able To Borrow (Max.)</Label>
<div className="flex w-full items-center gap-2">
  <div className="p-2 w-full rounded-lg border-gray-300 border">
  <p className='text-red-500'>{getTheMaxAmountOfTokensToBorrowBasedOnAmountAndToken()}</p>
</div>
<p className='text-red-500'>PLST</p>
</div>
  </div>

<CollateralTokensBalance/>
</Card>

<div className="flex flex-wrap w-full gap-2 justify-center">
<Button onClick={approveCollateral} className="p-6 transition-all shadow-sm shadow-black hover:bg-blue-900 cursor-pointer hover:scale-95 text-lg max-w-64 self-center w-full bg-blue-500">Approve Collateral</Button>
  
<Button disabled={!approved} onClick={collaterlizePosition} className="p-6 transition-all shadow-sm shadow-black hover:bg-red-600 cursor-pointer hover:scale-95 text-lg max-w-64 self-center w-full bg-red-500">Put Collateral</Button>
</div>

<OnChainDataContainer/>


  </TabsContent>
  )
}

export default ColltateralTab