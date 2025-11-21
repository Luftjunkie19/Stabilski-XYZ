import Link from 'next/link';
import React from 'react'
import { FaBitcoin, FaEthereum } from 'react-icons/fa6';
import { SiChainlink } from 'react-icons/si';
import { toast } from 'sonner';
import { BASE_SEPOLIA_WETH_ADDR, SEPOLIA_ETH_WBTC_ADDR, SEPOLIA_ETH_WETH_ADDR } from '@/lib/CollateralContractAddresses';
import { motion } from 'motion/react';

function ProjectDetails() {
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
    <div onClick={()=>{
      navigator.clipboard.writeText(`${SEPOLIA_ETH_WETH_ADDR}`);
      toast.success('Address Copied to clipboard');
    }}  className="flex cursor-pointer justify-between transition-all max-w-32 w-full hover:scale-95 gap-2 items-center p-2 rounded-lg bg-white border-black border shadow-sm shadow-black">
      <FaEthereum className='text-gray-500 text-xl'/>
      <p>WETH</p>
    </div>
    <Link href={`https://faucets.chain.link/`} target='_blank' className="flex cursor-pointer transition-all justify-between max-w-32 w-full hover:scale-95 gap-2 items-center p-2 rounded-lg bg-white border-black border shadow-sm shadow-black">
      <SiChainlink className='text-blue-500 text-2xl'/>
      <p>LINK</p>
    </Link>
    <div onClick={()=>{
    navigator.clipboard.writeText(`${SEPOLIA_ETH_WBTC_ADDR}`);
    toast.success('Address Copied to clipboard');
    }} className="flex cursor-pointer transition-all max-w-32 w-full justify-between hover:scale-95 gap-2 items-center p-2 rounded-lg bg-white border-black border shadow-sm shadow-black">
      <FaBitcoin className='text-orange-400 text-2xl'/>
      <p>BTC</p>
    </div>
  </div>
  </div>

   <div className="flex flex-col gap-2">
 <p className='text-white text-2xl font-bold
 text-shadow-sm text-shadow-black/25'>
  Sepolia Arbitrum
 </p>
  <div className="flex flex-wrap gap-2">
    
    <Link href={`https://faucets.chain.link/`} target='_blank' className="flex cursor-pointer transition-all justify-between max-w-32 w-full hover:scale-95 gap-2 items-center p-2 rounded-lg bg-white border-black border shadow-sm shadow-black">
      <SiChainlink className='text-blue-500 text-2xl'/>
      <p>LINK </p>
    </Link>
    
  </div>
  </div>


  <div className="flex flex-col gap-2">
 <p className='text-white text-2xl font-bold
 text-shadow-sm text-shadow-black/25'>
  Sepolia Base
 </p>
  <div className="flex flex-wrap gap-2">
    
    <Link href={`https://faucets.chain.link/`} target='_blank' className="flex cursor-pointer transition-all justify-between max-w-32 w-full hover:scale-95 gap-2 items-center p-2 rounded-lg bg-white border-black border shadow-sm shadow-black">
      <SiChainlink className='text-blue-500 text-2xl'/>
      <p>LINK</p>
    </Link>

        <div
        onClick={()=>{
          navigator.clipboard.writeText(BASE_SEPOLIA_WETH_ADDR)
       toast.success('WETH address copied successfully (BASE)')
        }}
        className="flex cursor-pointer transition-all justify-between max-w-32 w-full hover:scale-95 gap-2 items-center p-2 rounded-lg bg-white border-black border shadow-sm shadow-black">
      <FaEthereum 
      className='text-blue-700 text-2xl'/>
      <p>WETH</p>
    </div>
    
  </div>
  </div>

  

    </div>
  )
}

export default ProjectDetails