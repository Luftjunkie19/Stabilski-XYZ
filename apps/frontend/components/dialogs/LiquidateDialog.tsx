import React from 'react'
import stabilskiStableCoin from "@/public/Logox32.png"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { DialogDescription } from '@radix-ui/react-dialog';
import Image from 'next/image';

type Props = {
    isLiquidatable: boolean,
    commitLiquidation: ()=>void,
    approvePLST: ()=>void,
    vaultDebt: bigint,
    userBalance:bigint
}

function LiquidateDialog({isLiquidatable, approvePLST, commitLiquidation, vaultDebt, userBalance}: Props) {
  return (
   <Dialog>
  <DialogTrigger className={` p-2 rounded-lg text-sm text-white ${isLiquidatable as unknown as boolean && (isLiquidatable as unknown as boolean) ?  'bg-red-500 cursor-pointer' : 'bg-red-800 cursor-not-allowed'}  hover:bg-red-800 hover:scale-95`} disabled={isLiquidatable as unknown as boolean && (isLiquidatable as unknown as boolean) === false ? true : false}>
 Liquidate
  </DialogTrigger>
  <DialogContent className='flex flex-col gap-4 w-full '>
    <DialogHeader>
      <DialogTitle className='text-red-500 text-lg'>Liquidate Position</DialogTitle>
    <DialogDescription className='text-sm'>
        By performing action in this dialog, you confirm you want to liquidate the position, spending your PLST and receiving in exchange the value of PLST spent + liquidation bonus.
    </DialogDescription>
    </DialogHeader>


<div className="flex flex-col gap-4 p-2 max-w-10/12 w-full items-center justify-center">
<div className="w-full flex justify-between">
    <p className='font-semibold'>
 Tokens to be spent</p>
 <div className="flex items-center gap-2">
    <p className='font-bold text-red-500'>{(Number(vaultDebt) / 1e18).toFixed(2)}</p>
    <div className="flex items-center">
     <Image src={stabilskiStableCoin} alt='' width={64} height={64} className='w-8 h-8'/> <span className='text-red-500'>PLST</span>
    </div>

 </div>
</div>

<div className="w-full flex justify-between">
    <p className='font-semibold'> 
 Your Balance</p>
    <div className="flex items-center gap-2">
    <p className={`font-bold ${vaultDebt <= userBalance ? 'text-green-600' : 'text-red-500' }`}>{(Number(userBalance)/1e18).toFixed(2)}</p>
    <div className="flex items-center">
     <Image src={stabilskiStableCoin} alt='' width={64} height={64} className='w-8 h-8'/> <span className='text-red-500'>PLST</span>
    </div>

 </div>
   
</div>

{vaultDebt > userBalance && <p className='text-red-500 italic text-sm'>You have not enough PLST to liquidate this position.</p>}

</div>


<div className="flex items-center justify-center gap-3">
<Button onClick={approvePLST} className='bg-blue-600 cursor-pointer'>Approve PLST</Button>
    <Button className={`p-2 rounded-lg text-sm text-white ${isLiquidatable as unknown as boolean && (isLiquidatable as unknown as boolean) ?  'bg-red-500 cursor-pointer' : 'bg-red-800 cursor-not-allowed'}  hover:bg-red-800 hover:scale-95`}  disabled={isLiquidatable as unknown as boolean && (isLiquidatable as unknown as boolean) === false ? true : false} variant={'destructive'} onClick={commitLiquidation}>
    Liquidate Position
</Button>
</div>

  </DialogContent>
</Dialog>
  )
}

export default LiquidateDialog