import React from 'react'
import { ExternalToast, toast } from 'sonner';

type Props = {
    toastText: string;
    icon?: React.ReactNode | string;
    Link?: React.ReactNode;
}

function useToastContent() {
 const getToastContent=({toastText, icon, Link}: Props)=>{
     return {
    toastElement: <div className='flex items-center gap-2 w-full'>{toastText}
    {Link}
    </div>,
    toastSettings:{ duration: 4000, icon: icon, style:{
        background: '#1a1a1a',
        color: '#ffffff',
        position:'relative',
        top:'0px',
        left:'0px',
        overflow:'hidden',
        backdropFilter:'blur(10px)',
        border:'1px solid #ff0000',
        boxShadow:'0 0 5px #ff0000'
    },
} as ExternalToast
  }

  
}
const sendToastContent=({toastText, icon, Link, type}: {type?:'info' | 'error' | 'success' | 'warning' | 'loading'} & Props)=>{
    const {toastElement, toastSettings}=getToastContent({toastText, icon, Link});
 
    if(!type) toast(toastElement, toastSettings);
    else
    toast[type](toastElement, toastSettings);
    
}

    return {getToastContent, sendToastContent}
}

export default useToastContent