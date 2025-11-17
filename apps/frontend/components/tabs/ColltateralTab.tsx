'use client';
import React, { useCallback, useState } from 'react'
import { TabsContent } from '../ui/tabs'
import { Label } from '../ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select'
import { FaEthereum, FaBitcoin } from 'react-icons/fa6'
import { SiChainlink } from 'react-icons/si'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { useAccount, useReadContract, useReadContracts, useSwitchChain, useWatchContractEvent, useWriteContract } from 'wagmi'
import { usdplnOracleABI, usdplnOracleArbitrumSepoliaAddress, usdPlnOracleBaseSepoliaAddress, usdplnOracleEthSepoliaAddress } from '@/lib/smart-contracts-abi/USDPLNOracle';
import { ARBITRUM_SEPOLIA_ABI, ARBITRUM_SEPOLIA_CHAINID, ARBITRUM_SEPOLIA_LINK_ADDR, BASE_SEPOLIA_CHAINID, BASE_SEPOLIA_LINK_ABI, BASE_SEPOLIA_LINK_ADDR, BASE_SEPOLIA_WETH_ABI, BASE_SEPOLIA_WETH_ADDR, SEPOLIA_ETH_CHAINID, SEPOLIA_ETH_LINK_ABI, SEPOLIA_ETH_LINK_ADDR, SEPOLIA_ETH_WBTC_ABI, SEPOLIA_ETH_WBTC_ADDR, SEPOLIA_ETH_WETH_ABI, SEPOLIA_ETH_WETH_ADDR } from '@/lib/CollateralContractAddresses';
import { arbitrumSepoliaVaultManagerAddress, baseSepoliaVaultManagerAddress, ethSepoliaVaultManagerAddress, vaultManagerAbi } from '@/lib/smart-contracts-abi/VaultManager';
import { stabilskiTokenArbitrumSepoliaCollateralManagerAddress, stabilskiTokenBaseSepoliaCollateralManagerAddress, stabilskiTokenCollateralManagerAbi, stabilskiTokenSepoliaEthCollateralManagerAddress } from '@/lib/smart-contracts-abi/CollateralManager';
import { toast } from 'sonner';
import OnChainDataContainer from '../chain-data/OnChainDataContainer';


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

  const [amount, setAmount] = useState<number>(0);
  const [token, setToken] = useState<`0x${string}` | undefined>(undefined);
  const [maximumAmount, setMaximumAmount] = useState<number>(0);
  const [approved, setApproved] = useState<boolean>(false);
    const {chainId, address}=useAccount();

    const {writeContract}=useWriteContract();

    const currentTokenWatchAbi=()=>{
      switch(token){

        case SEPOLIA_ETH_WETH_ADDR:
          return SEPOLIA_ETH_WETH_ABI

        case SEPOLIA_ETH_WBTC_ADDR:
          return SEPOLIA_ETH_WBTC_ABI

        case SEPOLIA_ETH_LINK_ADDR:
          return SEPOLIA_ETH_LINK_ABI

          case ARBITRUM_SEPOLIA_LINK_ADDR:
            return ARBITRUM_SEPOLIA_ABI

          case BASE_SEPOLIA_WETH_ADDR:
            return BASE_SEPOLIA_WETH_ABI

          case BASE_SEPOLIA_LINK_ADDR:
            return BASE_SEPOLIA_LINK_ABI

        }
    }

    const currentAbi =currentTokenWatchAbi();


     useWatchContractEvent({
    address: token,
    abi: currentAbi,
    eventName: 'Approval',
    'onError':(error)=>{
      console.error('Error watching contract event:', error);
    
    },
  'onLogs':(logs)=>{
    console.log('New logs!', logs);
    setApproved(true);
    toast.success('Collateral approved successfully');
  },
  args:{
    owner: address,
  }
  });

  const currentVaultManager=()=>{
    switch(chainId){
case SEPOLIA_ETH_CHAINID:
  return ethSepoliaVaultManagerAddress;
  
  case ARBITRUM_SEPOLIA_CHAINID:
    return arbitrumSepoliaVaultManagerAddress

  case BASE_SEPOLIA_CHAINID:
    return baseSepoliaVaultManagerAddress
    }
  }

  const vaultManagerAddress = currentVaultManager();

  useWatchContractEvent({
    address: vaultManagerAddress,
    abi: vaultManagerAbi,
    eventName: 'CollateralDeposited',
    'onError':(error)=>{
      console.error('Error watching contract event:', error);
    },
  'onLogs':(logs)=>{
    toast.success(`Collateral successfully deposited ${
 ( Number(
  (logs[0] as any)
    .args
    .amount
  ) / (token !== SEPOLIA_ETH_WBTC_ADDR ? 1e18 : 1e8)).toFixed(4)} ${token === SEPOLIA_ETH_WBTC_ADDR ? 'WBTC' : token === SEPOLIA_ETH_WETH_ADDR ? 'WETH' : token === SEPOLIA_ETH_LINK_ADDR ? 'LINK' : 'LINK'}`);
  },
  args:{
    vaultOwner: address,
    token: token,
  },
  'enabled': amount > 0 && token !== undefined && address !== undefined && chainId !== undefined,
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

    const currentUsdPlnOracle=()=>{
      switch(chainId){
        case SEPOLIA_ETH_CHAINID:
          return usdplnOracleEthSepoliaAddress
        case ARBITRUM_SEPOLIA_CHAINID:
          return usdplnOracleArbitrumSepoliaAddress
        case BASE_SEPOLIA_CHAINID:
          return usdPlnOracleBaseSepoliaAddress
      }
    }

    const currentOraclePriceAddress= currentUsdPlnOracle();


    const {data:usdplnOraclePrice}=useReadContract({
         'abi': usdplnOracleABI,
        'address':currentOraclePriceAddress,
        'functionName':'getPLNPrice',
        'args':[],
        chainId
    });


    const getTheMaxAmountOfTokensToBorrowBasedOnAmountAndToken= useCallback(()=>{
      if(!collateralTokenPriceData || !usdplnOraclePrice || !token || !collateralData) return 0;

      if(collateralData && collateralTokenPriceData && usdplnOraclePrice && token){

        // const maxPlstBorrowable = await readContract(config, {
        //   address: ethSepoliaVaultManagerAddress,
        //   abi: vaultManagerAbi,
        //   functionName: 'getMaxBorrowableStabilskiTokens',
        //   args:[address, token]
        // });

        // console.log(maxPlstBorrowable);
        
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


  return (
    <TabsContent value="collateral" className="flex flex-col gap-4 max-w-7xl w-full">

<Card className=" w-full max-w-lg self-center shadow-sm border-red-500 border shadow-black h-96">
  <div className="h-1/2 py-1 px-3 border-b border-red-500 flex gap-3 flex-col">
  <Label className="text-xl text-red-500">You Give</Label>
<div className="flex items-center gap-4">
  <Input step={0.01} onChange={(e)=>setAmount(Number(e.target.value))} type="number" min={0} max={maximumAmount}  className="w-full"/>
 <Select value={token} onValueChange={(value) => {
setToken(value as `0x${string}`);
console.log(data);
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
<Button onClick={()=>{
if(token){
    writeContract({
    'abi':arrayOfContracts.find(contract => contract.address === token)!.abi,
    'address':arrayOfContracts.find(contract => contract.address === token)!.address as `0x${string}`,
    'functionName':'approve',
    'args':[chainId === SEPOLIA_ETH_CHAINID ? ethSepoliaVaultManagerAddress : chainId === ARBITRUM_SEPOLIA_CHAINID ? arbitrumSepoliaVaultManagerAddress : baseSepoliaVaultManagerAddress, amount * 1e18],
  }, {
    onSettled(data, error) {
      if (error) {
        console.error('Error approving collateral:', error);
        toast.error('Error approving collateral');
      } else {
        console.log('Collateral approved successfully:', data);
        toast.loading('Approving collateral.....',{ 'duration': 2.5, dismissible:true });
      }
    },
  })
}
}} className="p-6 transition-all shadow-sm shadow-black hover:bg-blue-900 cursor-pointer hover:scale-95 text-lg max-w-64 self-center w-full bg-blue-500">Approve Collateral</Button>
  
<Button disabled={!approved} onClick={()=>{
if(chainId === SEPOLIA_ETH_CHAINID && token && amount){
    writeContract({
    'abi':vaultManagerAbi,
    'address':ethSepoliaVaultManagerAddress,
    'functionName':'depositCollateral',
    'args':[token],
  });
  return;
}

if(chainId === ARBITRUM_SEPOLIA_CHAINID && token && amount){
  writeContract({
      'abi':vaultManagerAbi,
      'address':arbitrumSepoliaVaultManagerAddress,
      'functionName':'depositCollateral',
      'args':[token],
    });
return;
}

if(token && amount && chainId === BASE_SEPOLIA_CHAINID){
  writeContract({
      'abi':vaultManagerAbi,
      'address':baseSepoliaVaultManagerAddress,
      'functionName':'depositCollateral',
      'args':[token,],
    });
}





}} className="p-6 transition-all shadow-sm shadow-black hover:bg-red-600 cursor-pointer hover:scale-95 text-lg max-w-64 self-center w-full bg-red-500">Put Collateral</Button>
</div>

<OnChainDataContainer/>


  </TabsContent>
  )
}

export default ColltateralTab