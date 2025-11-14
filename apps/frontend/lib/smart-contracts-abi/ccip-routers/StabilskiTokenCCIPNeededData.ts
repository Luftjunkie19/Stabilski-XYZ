export const chainSelectorArbitrumSepolia = 3478487238524512106;
export const chainSelectorSepoliaEth = 16015286601757825753;
export const chainSelectorBaseSepolia= 10344971235874465080;

export const stabilskiTokenPoolBaseSepolia = "0x42745E532F1e35154e42dBAA8402F4abe3fFbc97";

export const stabilskiTokenPoolEthSepolia = "0x98C7955FaBB14d83D874B516f4C849f4E1fa0A7B";

export const stabilskiTokenPoolArbSepolia= "0xb0Cb10e3872A9F955758893E135A0C3579EA0187";


export const ccipInformationRetrieverSepoliaEthAddress = "0x9Abcf91e1E301091EC5cc808e1ab7916a4c032A1";

export const ccipInformationRetrieverSepoliaArbAddress = "0x12A6a3d30Fa3327338a4faE0f6ec0BDcf52eE715";

export const ccipInformationRetrieverSepoliaBaseAddress= "0xfC972770fc1b35A0F4eEb26bA56e6D294469308e";

export const ccipInformationRetrieverAbi= [{"inputs":[{"internalType":"address","name":"stabilskiSourceAddress","type":"address"},{"internalType":"address","name":"routerAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"receiverAddress","type":"address"},{"internalType":"uint256","name":"amountToSend","type":"uint256"},{"internalType":"uint64","name":"destinationSelector","type":"uint64"}],"name":"getCCIPMessageFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"receiverAddress","type":"address"},{"internalType":"uint256","name":"amountToSend","type":"uint256"}],"name":"getCcipMessage","outputs":[{"components":[{"internalType":"bytes","name":"receiver","type":"bytes"},{"internalType":"bytes","name":"data","type":"bytes"},{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct Client.EVMTokenAmount[]","name":"tokenAmounts","type":"tuple[]"},{"internalType":"address","name":"feeToken","type":"address"},{"internalType":"bytes","name":"extraArgs","type":"bytes"}],"internalType":"struct Client.EVM2AnyMessage","name":"","type":"tuple"}],"stateMutability":"view","type":"function"}];