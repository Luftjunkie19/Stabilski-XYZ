'use client';

import React from 'react'
import {MdCancel} from "react-icons/md";


function Error() {
  return (
    <div className='w-full flex flex-col gap-6 items-center p-2 overflow-hidden justify-center h-screen'>
        <p className='text-2xl text-white font-bold'>Blimey ! Error Occureed</p>

        <MdCancel className='text-9xl text-red-600'/>

<p className='text-center text-white font-light'>Try to connect with different wallet that supports EVM chains and reload the app.</p>
    </div>
  )
}

export default Error