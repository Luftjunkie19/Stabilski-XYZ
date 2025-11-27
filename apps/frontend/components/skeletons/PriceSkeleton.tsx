import React from 'react'
import { Skeleton } from '../ui/skeleton'

type Props = {}

function PriceSkeleton({}: Props) {
  return (
    <Skeleton className='w-16 h-6 rounded-md bg-gray-700'/>
  )
}

export default PriceSkeleton