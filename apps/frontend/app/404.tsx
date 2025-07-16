import Link from 'next/link'
import React from 'react'

function NotFound() {
  return (
    <div className='h-full flex justify-between items-center w-full'>
        <h1>404</h1>
        <p>Page not found</p>
        <p>Go back to <Link href='/'>Home</Link></p>
    </div>
  )
}

export default NotFound