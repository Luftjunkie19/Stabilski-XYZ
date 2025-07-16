import React from 'react'
import { TabsContent } from './ui/tabs'
import Header from './ui/Header'
import Image from 'next/image'
import StabilskiStableCoin2 from '@/public/Logox512.png';

function IntroTab() {
  return (
  <TabsContent value="intro" className="flex flex-col gap-3 max-w-4xl w-full">
    <Header/>
    <div className="flex w-full justify-between items-center flex-col sm:flex-row">

<Image src={StabilskiStableCoin2} width={240} height={240} alt="logo" className="w-60 h-60"/>
<div className="flex flex-col gap-2 max-w-lg w-full">
  <p className="text-3xl text-shadow-lg shadow-black font-bold text-red-500">Stabilski.XYZ</p>
  <p>It is a Lending Protocol for the Polish Złoty, where you can exchange your WETH, LINK and WBTC tokens on Sepolia Ethereum Testnet for PLST (Stabilski Tokens). You can also exchange your LINK on Arbitrum Sepolia Testnet for PLST.</p>
</div>
    </div>
  </TabsContent>
  )
}

export default IntroTab