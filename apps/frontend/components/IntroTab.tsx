'use client'

import React from 'react'
import { TabsContent } from './ui/tabs'
import Header from './ui/Header'
import Image from 'next/image'
import StabilskiStableCoin2 from '@/public/Logox512.png';
import { FaBitcoin, FaEthereum } from 'react-icons/fa6';
import { SiChainlink } from 'react-icons/si';
import Link from 'next/link';
import { SEPOLIA_ETH_WBTC_ADDR, SEPOLIA_ETH_WETH_ADDR } from '@/lib/CollateralContractAddresses';
import { toast } from 'sonner';

function IntroTab() {
  return (
  <TabsContent value="intro" className="flex flex-col gap-3 max-w-4xl w-full">
    <Header/>
    <div className="flex w-full justify-between items-center flex-col sm:flex-row">

<Image src={StabilskiStableCoin2} width={240} height={240} alt="logo" className="w-60 h-60"/>
<div className="flex flex-col gap-2 max-w-lg w-full">
  <p className="text-3xl text-shadow-lg shadow-black font-bold text-white">Stabil<span className='text-red-500'>ski.XYZ</span></p>
  <p className='text-black text-md text-shadow-xs text-shadow-white'>It is a Lending Protocol for the Polish Złoty, where you can exchange your WETH, LINK and WBTC tokens on Sepolia Ethereum Testnet for PLST (Stabilski Tokens). You can also exchange your LINK on Arbitrum Sepolia Testnet for PLST.</p>
</div>
    </div>

    <div className="flex flex-col gap-2">
<p className='text-black text-2xl text-shadow-sm text-shadow-white'>How does it work ?</p>

<p className='text-black text-lg text-shadow-sm text-shadow-white'>The Stabilski Polish Stablecoin Lending protocol works in the following way:</p>

<div className="flex flex-col gap-2 w-full">
 
 <div className="bg-white border border-black shadow-sm  flex mx-auto flex-col gap-3 shadow-black rounded-lg p-2 max-w-lg w-full">
  <p>
1. You exchange your native Sepolia ETH for one of the tokens listed below on <Link className='text-pink-500' href={`https://app.uniswap.org/`}>Uniswap</Link> or any other Dex that enables testnets.
  </p>

<p>
2. You then put an arbitrary amount of tokens as a collateral on the protocol.
</p>

<p>
3. You can then borrow the PLST token on the protocol.
</p>


  

 </div>

  <div className="flex flex-col gap-2">
 
 <p className='text-white text-shadow-sm text-shadow-black'>Sepolia Ethereum</p>
  <div className="flex flex-wrap gap-2">
    <div onClick={()=>{
      navigator.clipboard.writeText(`${SEPOLIA_ETH_WETH_ADDR}`);
      toast.success('Address Copied to clipboard');
    }}  className="flex cursor-pointer justify-between transition-all max-w-32 w-full hover:scale-95 gap-2 items-center p-2 rounded-lg bg-white border-black border shadow-sm shadow-black">
      <FaEthereum className='text-gray-500 text-xl'/>
      <p>Ethereum</p>
    </div>
    <Link href={`https://faucets.chain.link/`} target='_blank' className="flex cursor-pointer transition-all justify-between max-w-32 w-full hover:scale-95 gap-2 items-center p-2 rounded-lg bg-white border-black border shadow-sm shadow-black">
      <SiChainlink className='text-blue-500 text-2xl'/>
      <p>Chainlink</p>
    </Link>
    <div onClick={()=>{
    navigator.clipboard.writeText(`${SEPOLIA_ETH_WBTC_ADDR}`);
    toast.success('Address Copied to clipboard');
    }} className="flex cursor-pointer transition-all max-w-32 w-full justify-between hover:scale-95 gap-2 items-center p-2 rounded-lg bg-white border-black border shadow-sm shadow-black">
      <FaBitcoin className='text-orange-400 text-2xl'/>
      <p>Bitcoin</p>
    </div>
  </div>
  </div>

   <div className="flex flex-col gap-2">
 
 <p className='text-white text-shadow-sm text-shadow-black'>Arbitrum Sepolia</p>
  <div className="flex flex-wrap gap-2">
    
    <Link href={`https://faucets.chain.link/`} target='_blank' className="flex cursor-pointer transition-all justify-between max-w-32 w-full hover:scale-95 gap-2 items-center p-2 rounded-lg bg-white border-black border shadow-sm shadow-black">
      <SiChainlink className='text-blue-500 text-2xl'/>
      <p>Chainlink</p>
    </Link>
    
  </div>
  </div>
</div>

    </div>
  </TabsContent>
  )
}

export default IntroTab