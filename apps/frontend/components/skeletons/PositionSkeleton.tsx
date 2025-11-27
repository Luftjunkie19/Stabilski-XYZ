import React from 'react'
import { Skeleton } from '../ui/skeleton'

type Props = {}

function PositionSkeleton({}: Props) {
  return (
    <Skeleton className='w-full h-32 bg-gray-500 rounded-md' />
  )
}

export default PositionSkeleton