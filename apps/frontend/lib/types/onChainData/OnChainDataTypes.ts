import { Abi } from "viem";

export type ethereumAddress =`0x${string}`;

export interface ContractType {
    abi:Abi[],
    address:ethereumAddress,
    functionName:string,
    args?:ethereumAddress[],
    chainId: 11155111 | 421614 | 84532
};

export type ChainType = Pick<ContractType, 'chainId'>


export type vaultInfoReturnType = [bigint, bigint, ethereumAddress, bigint];
