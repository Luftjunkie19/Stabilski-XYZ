export type ethereumAddress =`0x${string}`;

export interface ContractType {
    abi:any[],
    address:ethereumAddress,
    functionName:string,
    args?:ethereumAddress[],
    chainId: 11155111 | 421614 | 84532
};

export type ChainType = Pick<ContractType, 'chainId'>


