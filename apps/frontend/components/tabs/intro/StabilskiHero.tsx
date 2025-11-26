import Image from 'next/image'
import React from 'react'
import stabilskiLogo from "../../../public/Logox512.png"
import { motion } from 'motion/react';


function StabilskiHero() {
  return (
    <div className='max-w-5xl w-full flex-wrap justify-center sm:justify-between items-center flex gap-8'>
        <motion.div initial={{transform:'translateX(-100%) scale(0.5)', opacity:0, transitionDuration:'1s'}} whileInView={{transform:'translateX(0%) scale(1)', opacity:1, transitionDuration:'1s'}} className='w-52 h-52' >
        <Image src={stabilskiLogo} alt='' width={128} height={128} className='w-52 h-52'/>
        </motion.div>

        <motion.div  initial={{transform:'translateX(100%) scale(0.5)','transitionDelay': '1s', animationDelay:'1s', opacity:0, transitionDuration:'1s'}} whileInView={{transform:'translateX(0%) scale(1)', opacity:1, transitionDuration:'1s', 'transitionDelay': '1s', animationDelay:'1s'}} className="flex flex-col gap-3 max-w-xl">
            <p className='text-2xl font-bold'>Stabilski — Borrow PLST, the on‑chain Polish złoty</p>
            <p>Provide crypto collateral to borrow PLST, a PLN‑pegged stable token. Instantly mint PLST, manage positions securely, and transfer funds across chains via built‑in bridges.</p>
            <ul className='flex flex-col gap-2 list-disc'>
                <li>Fast, overcollateralized loans in PLST — borrow a stable złoty equivalent without selling assets.</li>
                <li>Cross‑chain PLST bridges — transfer your PLN‑pegged tokens between chains seamlessly.</li>
                <li>Transparent protocol rules and on‑chain liquidation mechanics for predictable risk.</li>
            </ul>
        </motion.div>
    </div>
  )
}

export default StabilskiHero