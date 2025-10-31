'use client'
import React from 'react'
import Image from 'next/image'
import StabilskiStableCoin2 from '@/public/Logox512.png';
import { motion } from 'motion/react';
type Props = {}

function StabilskiXYZHero({}: Props) {
  return (
    <div className="flex w-full justify-between items-center flex-col sm:flex-row">
        <motion.div whileInView={{
    transform:'translateX(0%) scale(1)', opacity:1, transitionDuration:'1.5s',
    transitionDelay:'2s'
    }} initial={{transform:'translateX(-100%) scale(0.5)', opacity:0, transitionDuration:'1.5s', transitionDelay:'2s'
}} className="w-60 h-60">
            <Image src={StabilskiStableCoin2} width={240} height={240} alt="logo" className="w-full h-full"/>
        </motion.div>
<motion.div whileInView={{
    transform:'translateX(0%) scale(1)', opacity:1, transitionDuration:'1.5s', transitionDelay:'2s'
    }} initial={{transform:'translateX(100%) scale(0.5)', opacity:0, transitionDuration:'1.5s', transitionDelay:'2s'
}} className="flex flex-col gap-2 max-w-lg w-full">
  <p className="text-3xl text-shadow-lg shadow-black font-bold text-white">Stabil<span className='text-red-500'>ski.XYZ</span></p>
  <p className='text-black text-md text-shadow-xs text-shadow-white'>It is a Lending Protocol for the Polish Złoty, where you can exchange your WETH, LINK and WBTC tokens on Sepolia Ethereum Testnet for PLST (Stabilski Tokens). You can also exchange your LINK on Arbitrum Sepolia Testnet for PLST.</p>
</motion.div>
    </div>
  )
}

export default StabilskiXYZHero