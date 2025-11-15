export const chainSelectorArbitrumSepolia = 3478487238524512106;
export const chainSelectorSepoliaEth = 16015286601757825753;
export const chainSelectorBaseSepolia= 10344971235874465080;

export const stabilskiTokenPoolBaseSepolia = "0x42745E532F1e35154e42dBAA8402F4abe3fFbc97";

export const stabilskiTokenPoolEthSepolia = "0x98C7955FaBB14d83D874B516f4C849f4E1fa0A7B";

export const stabilskiTokenPoolArbSepolia= "0xb0Cb10e3872A9F955758893E135A0C3579EA0187";


export const ccipInformationRetrieverSepoliaEthAddress = "0xDEd9cf2f291e0eC1f17fB73b7a8D52E606b90900";

export const ccipInformationRetrieverSepoliaArbAddress = "0x6057EA55A5161EFAEd5aDa8a2D2006fD9c9A8902";

export const ccipInformationRetrieverSepoliaBaseAddress= "0xc912a30a09590fF9cd9FE424db744f208dE47A39";

export const ccipInformationRetrieverAbi= [{"inputs":[{"internalType":"address","name":"stabilskiSourceAddress","type":"address"},{"internalType":"address","name":"routerAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"receiverAddress","type":"address"},{"internalType":"uint256","name":"amountToSend","type":"uint256"},{"internalType":"uint64","name":"destinationSelector","type":"uint64"}],"name":"getCCIPMessageFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"receiverAddress","type":"address"},{"internalType":"uint256","name":"amountToSend","type":"uint256"}],"name":"getCcipMessage","outputs":[{"components":[{"internalType":"bytes","name":"receiver","type":"bytes"},{"internalType":"bytes","name":"data","type":"bytes"},{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct Client.EVMTokenAmount[]","name":"tokenAmounts","type":"tuple[]"},{"internalType":"address","name":"feeToken","type":"address"},{"internalType":"bytes","name":"extraArgs","type":"bytes"}],"internalType":"struct Client.EVM2AnyMessage","name":"","type":"tuple"}],"stateMutability":"view","type":"function"}];