import { ethereumAddress } from '@/lib/types/onChainData/OnChainDataTypes'
import React from 'react'
import VaultTokenPosition from './element/VaultTokenPosition'

type Props = {
    collateralManagerAddress:ethereumAddress,
    depositors:ethereumAddress[],
    vaultManagerAddress:ethereumAddress,
    tokenAddr: ethereumAddress

}

function ListOfPositions({collateralManagerAddress, vaultManagerAddress, depositors, tokenAddr}: Props) {
  return (
 <>
 { (depositors as unknown as ethereumAddress[]).map((depositor:ethereumAddress)=> <VaultTokenPosition 
   collateralManagerAddress={collateralManagerAddress as ethereumAddress} 
   vaultManagerAddress={vaultManagerAddress} key={tokenAddr} 
   depositor={depositor as ethereumAddress} 
   tokenAddress={tokenAddr as ethereumAddress}/>)}
 </>
  )
}

export default ListOfPositions