import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog'
import React from 'react'
import { DialogHeader } from '../ui/dialog'
import { Button } from '../ui/button'

function WithdrawDialog() {
  return (
<Dialog>
  <DialogTrigger>
    <Button variant={'destructive'} className={`bg-red-500 cursor-pointer  hover:bg-red-800 hover:scale-95`} >Withdraw</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Withdraw Your Collateral</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
  )
}

export default WithdrawDialog