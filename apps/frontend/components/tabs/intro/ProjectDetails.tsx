import React from 'react'
import { FaBitcoin, FaEthereum } from 'react-icons/fa6';
import { SiChainlink } from 'react-icons/si';
import { ARBITRUM_SEPOLIA_LINK_ADDR, BASE_SEPOLIA_LINK_ADDR, BASE_SEPOLIA_WETH_ADDR, SEPOLIA_ETH_LINK_ADDR, SEPOLIA_ETH_WBTC_ADDR, SEPOLIA_ETH_WETH_ADDR } from '@/lib/CollateralContractAddresses';
import ContractAddress, { ContractsType } from './elements/ContractAddress';

function ProjectDetails() {

  const contracts:(ContractsType & {network:'eth' | 'arb' | 'base' })[]=[
    {address:SEPOLIA_ETH_WETH_ADDR, Icon:FaEthereum, iconStyles:'text-gray-500 text-xl', label:'WETH', network:'eth'},
    {address:SEPOLIA_ETH_WBTC_ADDR, Icon:FaBitcoin, iconStyles:'text-orange-400 text-2xl', label:'WBTC', network:'eth'},
    {address:SEPOLIA_ETH_LINK_ADDR, Icon:SiChainlink, iconStyles:'text-blue-500 text-2xl', label:'LINK', network:'eth'},
    {address:ARBITRUM_SEPOLIA_LINK_ADDR, Icon:SiChainlink, iconStyles:'text-blue-500 text-2xl', label:'LINK', network:'arb'},
    {address:BASE_SEPOLIA_LINK_ADDR, Icon:SiChainlink, iconStyles:'text-blue-500 text-2xl', label:'LINK', network:'base'},
    {address:BASE_SEPOLIA_WETH_ADDR, Icon:FaEthereum, iconStyles:'text-blue-700 text-2xl', label:'WETH', network:'base'},
  ]
  
  return (
        <div className="flex flex-col gap-2">

<div className="self-center">
  <p className='text-white text-2xl font-bold text-shadow-sm text-shadow-black/75'>
    Supported Chains & Tokens
  </p>
</div>

<div className="flex flex-col gap-2">
 
 <p className='text-white text-2xl font-bold
 text-shadow-sm text-shadow-black/25
 '>Sepolia Ethereum</p>
  <div className="flex flex-wrap gap-2">
    {contracts.filter(c=>c.network==='eth').map((contract, index)=>(<ContractAddress key={index} {...contract}/>))}
  </div>
  </div>

   <div className="flex flex-col gap-2">
 <p className='text-white text-2xl font-bold
 text-shadow-sm text-shadow-black/25'>
  Sepolia Arbitrum
 </p>
  <div className="flex flex-wrap gap-2">
    {contracts.filter(c=>c.network==='arb').map((contract, index)=>(<ContractAddress key={index} {...contract}/>))}
  </div>
  </div>


  <div className="flex flex-col gap-2">
 <p className='text-white text-2xl font-bold
 text-shadow-sm text-shadow-black/25'>
  Sepolia Base
 </p>
  <div className="flex flex-wrap gap-2">
    {contracts.filter(c=>c.network==='base').map((contract, index)=>(<ContractAddress key={index} {...contract}/>))}
  </div>
  </div>

  

    </div>
  )
}

export default ProjectDetails