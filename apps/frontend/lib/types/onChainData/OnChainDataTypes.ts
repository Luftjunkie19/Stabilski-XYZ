import { Abi, Log } from "viem";


export type ethereumAddress =`0x${string}`;

export interface ContractType {
    abi:Abi[] | Abi,
    address:ethereumAddress,
    functionName:string,
    args?:ethereumAddress[],
    chainId: 11155111 | 421614 | 84532
};

export type ChainType = Pick<ContractType, 'chainId'>


export type vaultInfoReturnType = [bigint, bigint, ethereumAddress, bigint];

export type singleResultType<T>={
    result: T,
    status?:'success'
}


export type collateralInfoType=[
    ethereumAddress,
    bigint,
    boolean,
    bigint,
    bigint
];


export interface ImprovedLog<T> extends Log{
    args?:T
}

export interface CollateralDeposited {
    vaultOwner: ethereumAddress,
    token: ethereumAddress,
    amount:bigint
}

export interface ApprovalInterface{
    owner:ethereumAddress,
    spender:ethereumAddress,
    value: bigint
}

export interface WethInterface{
    src:ethereumAddress,
    guy:ethereumAddress,
    wad:bigint
}
