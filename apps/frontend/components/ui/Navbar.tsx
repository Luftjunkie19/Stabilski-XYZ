'use client';

import Image from 'next/image'
import React from 'react'
import navbarLogo from "../../public/Logox192.png"
import { ConnectKitButton } from 'connectkit'
import Link from 'next/link';

function Navbar() {
  return (
    <div
    className={`flex
    items-center
justify-center
    p-1 w-full bg-red-500/50
     sticky top-0 z-50 
     `}
    >
<div className='flex mx-auto max-w-6xl items-center justify-between w-full'>
    <Link href={'/'} className="flex items-center space-x-2">
   <Image src={navbarLogo} width={64} height={64} alt="logo" className='w-16 h-16'/>
   <p className='hidden sm:block text-lg  md:text-2xl font-bold --font-audiowide text-white tracking-wider'>
     Stabilski.xyz
   </p>
</Link>
<ConnectKitButton   />
</div>

    </div>
  )
}

export default Navbar