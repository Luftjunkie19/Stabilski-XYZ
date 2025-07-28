export const stabilskiTokenArbReceiver:`0x${string}`="0xcA5D2236c8093a1845190E745AaFf0D4579A1871";

export const stabilskiTokenArbSender:`0x${string}`="0x042a92327771A7D0EE54D7255FCF26c3e377BbEC";


export const stabilskiTokenSepoliaReceiver:`0x${string}`="0x207A4ed4c4Ef66A939C0A66E2046b4a8a7Ae5405";
export const stabilskiTokenSepoliaSender:`0x${string}`="0xFB3d3Eecf548F736b8Ac8b7a35c1BBF36FEA55Cd";


export const chainSelectorArbitrumSepolia =3478487238524512106;

export const chainSelectorSepoliaEth = 16015286601757825753;

export const stabilskiTokenReceiverABI= [
    {"type":"constructor","inputs":[{"name":"router","type":"address","internalType":"address"},{"name":"_destinationStabilskiPool","type":"address","internalType":"address"},{"name":"_sourceStabilskiPool","type":"address","internalType":"address"},
        {"name":"_destinationStabilskiToken","type":"address","internalType":"address"}],"stateMutability":"nonpayable"},
        
        {"type":"function","name":"ccipReceive","inputs":[{"name":"message","type":"tuple","internalType":"struct Client.Any2EVMMessage","components":[
            {"name":"messageId","type":"bytes32","internalType":"bytes32"},{"name":"sourceChainSelector","type":"uint64","internalType":"uint64"},
            {"name":"sender","type":"bytes","internalType":"bytes"},{"name":"data","type":"bytes","internalType":"bytes"},
            {"name":"destTokenAmounts","type":"tuple[]","internalType":"struct Client.EVMTokenAmount[]",
                "components":[{"name":"token","type":"address","internalType":"address"},{"name":"amount","type":"uint256","internalType":"uint256"}]}]}],
                "outputs":[],"stateMutability":"nonpayable"},
                
                {"type":"function","name":"getRouter",
                    "inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
                    
                    {"type":"function","name":"supportsInterface","inputs":[{"name":"interfaceId","type":"bytes4","internalType":"bytes4"}],
                    "outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"},
                    
                    {"type":"event","name":"MessageReceived",
                        "inputs":[{"name":"messageId","type":"bytes32","indexed":true,"internalType":"bytes32"},
                            {"name":"sourceChainSelector","type":"uint64","indexed":false,"internalType":"uint64"},
                            {"name":"sender","type":"address","indexed":false,"internalType":"address"},{"name":"data","type":"bytes","indexed":false,"internalType":"bytes"}],
                            "anonymous":false},

                            {"type":"error","name":"InvalidRouter","inputs":[{"name":"router","type":"address","internalType":"address"}]},

                            {"type":"error","name":"UnauthorizedSender","inputs":[{"name":"sender","type":"address","internalType":"address"}]}];

export const stabilskiTokenSenderABI= [
    {"type":"constructor","inputs":[
    {"name":"_router","type":"address","internalType":"address"},
    {"name":"_pool","type":"address","internalType":"address"}],"stateMutability":"nonpayable"},
   
    {"type":"function","name":"bridgeTokens","inputs":[{"name":"destinationChainSelector","type":"uint64","internalType":"uint64"},
        {"name":"destinationToken","type":"address","internalType":"address"},{"name":"destReceiver","type":"address","internalType":"address"},
        {"name":"amount","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"payable"},

        {"type":"function","name":"getFee","inputs":[
            {"name":"amount","type":"uint256","internalType":"uint256"},
        {"name":"destinationChainSelector","type":"uint64","internalType":"uint64"},
        {"name":"destinationToken","type":"address","internalType":"address"}
        ,{"name":"destReceiver","type":"address","internalType":"address"}
    ],
    "outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},

    {"type":"function","name":"owner","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
    {"type":"function","name":"pool","inputs":[],"outputs":[{"name":"","type":"address","internalType":"contract StabilskiTokenPool"}],"stateMutability":"view"},
    {"type":"function","name":"router","inputs":[],"outputs":[{"name":"","type":"address","internalType":"contract IRouterClient"}],"stateMutability":"view"},
    {"type":"error","name":"InsufficientFunds","inputs":[]},
{"type":"error","name":"NotEnoughArrayMemoryAllocated",
    "inputs":[]}];