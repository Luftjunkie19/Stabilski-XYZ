'use client';
import { ARBITRUM_SEPOLIA_ABI, ARBITRUM_SEPOLIA_CHAINID, ARBITRUM_SEPOLIA_LINK_ADDR } from '@/lib/CollateralContractAddresses';
import { stabilskiTokenArbitrumSepoliaCollateralManagerAddress, stabilskiTokenCollateralManagerAbi } from '@/smart-contracts-abi/CollateralManager';
import { arbitrumSepoliaVaultManagerAddress, vaultManagerAbi } from '@/smart-contracts-abi/VaultManager';
import React from 'react'
import { SiChainlink } from 'react-icons/si'
import { useAccount, useReadContract } from 'wagmi';
import Image from 'next/image';
import StabilskiStableCoin from '@/public/Logox32.png';

function ArbitrumDataWidget() {
const {chainId, address

}=useAccount();

   const {data:arbitrumSepoliaPriceFeed}=useReadContract({
        abi:stabilskiTokenCollateralManagerAbi,
        address:stabilskiTokenArbitrumSepoliaCollateralManagerAddress,
        functionName:'collateralTokens',
        args:[]
    });

    
        const {data:arbitrumSepoliaBalance}=useReadContract({
            abi:ARBITRUM_SEPOLIA_ABI,
            address:ARBITRUM_SEPOLIA_LINK_ADDR,
            functionName:'balanceOf',
            args:[address],
        });

    const {data:vaultSepoliaArbitrumManagerContract}=useReadContract(
            {
                'abi':vaultManagerAbi,
                'address':arbitrumSepoliaVaultManagerAddress,
                'functionName':'getCollateralValue',
                'args':[address, ARBITRUM_SEPOLIA_LINK_ADDR],
                chainId:ARBITRUM_SEPOLIA_CHAINID
    });

       const {data:arbitrumSepoliaCollateralData}=useReadContract({
        abi:stabilskiTokenCollateralManagerAbi,
        address:stabilskiTokenArbitrumSepoliaCollateralManagerAddress,
        functionName:'getCollateralInfo',
        args:[ARBITRUM_SEPOLIA_LINK_ADDR],
    });


  return (
   <div className="flex flex-col gap-6 max-w-sm w-full
    bg-white p-4 rounded-lg border-red-500 border-1 shadow-md shadow-black h-64">
  <p>Arbitrum Sepolia Onchain Info</p>
  {arbitrumSepoliaPriceFeed as unknown as bigint && 
<div className="flex flex-col gap-2">
  <p>Crypto Prices (USD)</p>
<div  className="w-full flex items-center gap-6">

<div className='flex items-center gap-1'><SiChainlink className='text-blue-500'/> {arbitrumSepoliaPriceFeed as unknown as bigint && (Number(arbitrumSepoliaPriceFeed) / 1e18).toFixed(2)} $</div>
</div>
</div>
}

<p
onClick={()=>console.log(arbitrumSepoliaCollateralData, vaultSepoliaArbitrumManagerContract)}
>Get this shit</p>

{chainId && vaultSepoliaArbitrumManagerContract as unknown as bigint &&
<div className="flex flex-col gap-1 w-full max-w-lg">
<p>Your Collateral</p>
<div  className="w-full flex items-center gap-6">
<div className='flex items-center gap-1'><SiChainlink className='text-blue-500'/> {vaultSepoliaArbitrumManagerContract as unknown as bigint && (Number(vaultSepoliaArbitrumManagerContract) / 1e18).toFixed(2)}
</div>
 <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} />
</div>
</div>
}
<p
className='flex items-center gap-2'
onClick={() => console.log("got balance",
    arbitrumSepoliaBalance)}>Balance: {arbitrumSepoliaBalance as unknown as bigint && (Number(arbitrumSepoliaBalance) / 1e18).toFixed(2)}
    <SiChainlink
    className='text-blue-500    '
    />
    </p>

</div>
  )
}

export default ArbitrumDataWidget