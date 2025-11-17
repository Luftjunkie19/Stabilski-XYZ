export const chainSelectorArbitrumSepolia = 3478487238524512106;
export const chainSelectorSepoliaEth = 16015286601757825753;
export const chainSelectorBaseSepolia= 10344971235874465080;

export const stabilskiTokenPoolBaseSepolia = "0xe315bb6ab55154e3d13468e59b668cbacc81a936";

export const stabilskiTokenPoolEthSepolia = "0x1249b5954ee762e9940587d720d43a67f902b834";

export const stabilskiTokenPoolArbSepolia= "0x1249b5954ee762e9940587d720d43a67f902b834";


export const ccipInformationRetrieverSepoliaEthAddress = "0x72acadf5b542404e8892e4100b880483362299c2";

export const ccipInformationRetrieverSepoliaArbAddress = "0x72acadf5b542404e8892e4100b880483362299c2";

export const ccipInformationRetrieverSepoliaBaseAddress= "0xdb85a683c3907cae918949761ac034b07412319b";

export const ccipInformationRetrieverAbi= [{"inputs":[{"internalType":"address","name":"stabilskiSourceAddress","type":"address"},{"internalType":"address","name":"routerAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"receiverAddress","type":"address"},{"internalType":"uint256","name":"amountToSend","type":"uint256"},{"internalType":"uint64","name":"destinationSelector","type":"uint64"}],"name":"getCCIPMessageFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"receiverAddress","type":"address"},{"internalType":"uint256","name":"amountToSend","type":"uint256"}],"name":"getCcipMessage","outputs":[{"components":[{"internalType":"bytes","name":"receiver","type":"bytes"},{"internalType":"bytes","name":"data","type":"bytes"},{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct Client.EVMTokenAmount[]","name":"tokenAmounts","type":"tuple[]"},{"internalType":"address","name":"feeToken","type":"address"},{"internalType":"bytes","name":"extraArgs","type":"bytes"}],"internalType":"struct Client.EVM2AnyMessage","name":"","type":"tuple"}],"stateMutability":"view","type":"function"}];