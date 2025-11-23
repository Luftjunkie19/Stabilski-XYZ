import { ethereumAddress } from '@/lib/types/onChainData/OnChainDataTypes'
import React from 'react'
import VaultTokenPosition from './element/VaultTokenPosition'

type Props = {depositors:ethereumAddress[], 
    collateralManagerAddress:ethereumAddress,
   vaultManagerAddress:ethereumAddress,
   tokenAddr:ethereumAddress
}

function VaultPositions({depositors, collateralManagerAddress, vaultManagerAddress, tokenAddr}: Props) {
  return (
    <>
    {(depositors as unknown as ethereumAddress[]).map((depositor:ethereumAddress)=>
  <VaultTokenPosition 
  collateralManagerAddress={collateralManagerAddress} 
  vaultManagerAddress={vaultManagerAddress} key={crypto.randomUUID()}
  depositor={depositor} 
  tokenAddress={tokenAddr}/>)}
    </>
  )
}

export default VaultPositions