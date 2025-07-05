'use client';

import React from 'react'
import StabilskiStableCoin from '@/public/Logox192.png'
import Image from "next/image";
import { motion } from "motion/react";
import { TextGenerateEffect } from './text-generate-effect';


function Header() {
const words='A Polish StableCoin Lending Protocol, where you truly experience the Polish Złoty Power.';
  return (
<div  className="flex flex-col gap-2 mx-auto max-w-3xl p-6 items-center w-full">
    <motion.div initial={{transform:'translateY(100%) scale(0.5)', opacity:0, transitionDuration:'1s'}} whileInView={{transform:'translateY(0%) scale(1)', opacity:1, transitionDuration:'1s'}}>
  <Image src={StabilskiStableCoin} width={128} height={128} alt="logo" className="w-40 h-40"/>
    </motion.div>
  <motion.h1 initial={{transform:'scale(0.5)', opacity:0, transitionDelay:'0.25s', transitionDuration:'0.5s'}} whileInView={{transform:'scale(1)', opacity:1, transitionDelay:'0.25s', transitionDuration:'0.5s'}} className="text-4xl text-shadow-lg shadow-black text-center font-bold  text-red-500">Welcome to Stabilski</motion.h1>
<div className="max-w-6xl w-full">
  <TextGenerateEffect  className='m-0 items-center w-full ' words={words} /> 
</div>
</div>
  )
}

export default Header