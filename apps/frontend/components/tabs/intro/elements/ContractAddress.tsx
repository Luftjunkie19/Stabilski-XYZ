import useToastContent from '@/lib/hooks/useToastContent';
import { ethereumAddress } from '@/lib/types/onChainData/OnChainDataTypes';
import React from 'react'
import { IconType } from 'react-icons/lib';

export type ContractsType = {address:ethereumAddress, Icon:IconType, iconStyles:string, label:string}

function ContractAddress({address, Icon, iconStyles, label}: ContractsType) {
    const {sendToastContent}=useToastContent();
  return (
    <div onClick={()=>{
      navigator.clipboard.writeText(`${address}`);
      sendToastContent({toastText:'Address Copied to clipboard', icon:'✅', type:'success'});
    }}  className="flex cursor-pointer justify-between transition-all max-w-32 w-full hover:scale-95 gap-2 items-center p-2 rounded-lg text-white bg-neutral-800 border-red-500 border shadow-sm shadow-black">
      <Icon className={`${iconStyles}`}/>
      <p>{label}</p>
    </div>
  )
}

export default ContractAddress