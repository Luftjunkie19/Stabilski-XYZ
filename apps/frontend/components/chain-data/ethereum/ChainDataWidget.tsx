import { SEPOLIA_ETH_WBTC_ADDR, SEPOLIA_ETH_CHAINID, SEPOLIA_ETH_WETH_ADDR, SEPOLIA_ETH_LINK_ADDR } from '@/lib/CollateralContractAddresses';
import { stabilskiTokenCollateralManagerAbi, stabilskiTokenSepoliaEthCollateralManagerAddress } from '@/lib/smart-contracts-abi/CollateralManager';
import { vaultManagerAbi, ethSepoliaVaultManagerAddress } from '@/lib/smart-contracts-abi/VaultManager';
import Image from 'next/image';
import React from 'react'
import { FaBitcoin, FaEthereum } from 'react-icons/fa6';
import { SiChainlink } from 'react-icons/si';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import StabilskiStableCoin from '@/public/Logox32.png';
import { stabilskiTokenABI, stabilskiTokenEthSepoliaAddress } from '@/lib/smart-contracts-abi/StabilskiToken';
import DepositsCard from './DepositsCard';
import YourVaults from './YourVaults';
import { usdplnOracleABI, usdplnOracleEthSepoliaAddress } from '@/lib/smart-contracts-abi/USDPLNOracle';


function ChainDataWidget() {
const {chainId, address}=useAccount();
        const {data:vaultSepoliaEthereumManagerContract}=useReadContracts({
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

        const {data:balancePLST} = useReadContract(
            {
          abi:stabilskiTokenABI,
          address: stabilskiTokenEthSepoliaAddress,
          functionName:'balanceOf',
          args:[address],
            chainId:SEPOLIA_ETH_CHAINID
            }
        );

        const {data:oraclePrice}=useReadContract({
          abi:usdplnOracleABI,
          address: usdplnOracleEthSepoliaAddress,
          functionName:'getPLNPrice',
          args:[],
          chainId:SEPOLIA_ETH_CHAINID
        })


  return (
<div className="w-full flex items-center justify-center flex-wrap gap-4">
        <div className="flex flex-col gap-6 max-w-md bg-white border-red-500 border-1 shadow-md shadow-black p-4 rounded-lg h-64">
  {collateralTokenPriceData && 
<div className="flex flex-col gap-2">
  <p className='text-red-500'>Crypto Prices (USD)</p>
<div onClick={() => console.log(collateralTokenPriceData)} className="w-full flex items-center gap-6">
<div className='flex text-sm items-center gap-1'>
  <FaBitcoin className='text-orange-500 text-base'/> {collateralTokenPriceData[0] && (Number(collateralTokenPriceData[0].result) / 1e18).toFixed(2)}
</div>
<div className='flex text-sm items-center gap-1'><FaEthereum className='text-zinc-500 text-base'/> {(collateralTokenPriceData[1] && Number(collateralTokenPriceData[1].result)/ 1e18).toFixed(2)}</div>
<div className='flex text-sm items-center gap-1'><SiChainlink className='text-blue-500 text-base'/> {collateralTokenPriceData[2] && (Number(collateralTokenPriceData[2].result) / 1e18).toFixed(2)}</div>
</div>

</div>
}


{chainId && vaultSepoliaEthereumManagerContract &&
<div className="flex flex-col overflow-y-auto gap-1">
<p className='text-red-500'>Your Collateral</p>
<div  className="w-full flex items-center gap-6">
<div className='flex items-center gap-1'>
  <FaBitcoin className='text-orange-500'/> {vaultSepoliaEthereumManagerContract[0] && vaultSepoliaEthereumManagerContract[0].result as unknown as bigint && Number(vaultSepoliaEthereumManagerContract[0].result)  && (Number(vaultSepoliaEthereumManagerContract[0].result) / 1e18).toFixed(2)} <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} />
</div>
<div className='flex items-center gap-1'><FaEthereum className='text-zinc-500'/> {vaultSepoliaEthereumManagerContract[1] && vaultSepoliaEthereumManagerContract[1].result as unknown as bigint   && Number(vaultSepoliaEthereumManagerContract[1].result)  && (Number(vaultSepoliaEthereumManagerContract[1].result)/ 1e18).toFixed(2)} <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} /></div>
<div className='flex items-center gap-1'><SiChainlink className='text-blue-500'/> {vaultSepoliaEthereumManagerContract[2] && vaultSepoliaEthereumManagerContract[2].result as unknown as bigint && Number(vaultSepoliaEthereumManagerContract[2].result)  && (Number(vaultSepoliaEthereumManagerContract[2].result) / 1e18).toFixed(2)} <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} /></div>
</div>

<p className='py-2 flex md:items-center flex-col md:flex-row items-start gap-2'>
  Your PLST Balance: {balancePLST as unknown as bigint
   && <span
   className='text-red-500
   flex items-center gap-1
   '
   >
    {(Number(balancePLST) / 1e18).toFixed(2)}
   <Image src={StabilskiStableCoin} alt="alt" width={24} height={24} />
   </span>
    
   }
</p>

{oraclePrice as unknown as bigint && <p className="text-sm text-zinc-500 sm:text-base tracking">USD/PLN (Ethereum Sepolia): <span className='text-red-500 font-bold'>{(Number(oraclePrice) / 1e4).toFixed(4)} PLN</span></p>}
</div>
}


</div>


<DepositsCard/>
<YourVaults/>


</div>

  )
}

export default ChainDataWidget

