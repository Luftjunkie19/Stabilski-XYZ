// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {Client} from "../../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/libraries/Client.sol";
import {IRouterClient} from "../../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {StabilskiTokenInterface} from "../interfaces/StabilskiTokenInterface.sol";
import {StabilskiTokenPool} from "../pools/StabilskiTokenPool.sol";
import {Pool}  from "../../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/libraries/Pool.sol";
contract StabilskiTokenSender {
  error InsufficientFunds();
    error NotEnoughArrayMemoryAllocated();

    StabilskiTokenPool public pool;
    address public owner;
    IRouterClient public router;

    constructor(address _router, address _pool) {
        owner = msg.sender;
        router = IRouterClient(_router);
        pool = StabilskiTokenPool(_pool);
    }
function bridgeTokens(
    uint64 destinationChainSelector,
    address destinationToken,
        address destReceiver, // address on destination chain
        uint256 amount) external payable {

// Create LockOrBurnInV1 struct
        Pool.LockOrBurnInV1 memory burnParams = Pool.LockOrBurnInV1({
            originalSender: msg.sender,
            receiver: abi.encode(destReceiver),
            amount: amount,
            localToken: destinationToken,
            remoteChainSelector: destinationChainSelector
        });


        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: pool.getRemoteToken(),
            amount: amount
        });

  // Construct CCIP message
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(destReceiver),
            data: abi.encode(burnParams), // this is the encoded LockOrBurnInV1
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200_000}) // adjust as needed
            ),
            feeToken: address(0) // native gas token
        });


 // Calculate fee
        uint256 fees = router.getFee(destinationChainSelector, message);
        if (msg.value < fees) revert InsufficientFunds();

        // Send via CCIP
        router.ccipSend{value: fees}(destinationChainSelector, message);
}

function getFee(uint256 amount, uint64 destinationChainSelector, address destinationToken, address destReceiver) public view returns (uint256){
    Pool.LockOrBurnInV1 memory burnParams = Pool.LockOrBurnInV1({
            originalSender: msg.sender,
            receiver: abi.encode(destReceiver),
            amount: amount,
            localToken: destinationToken,
            remoteChainSelector: destinationChainSelector
        });
    
 Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: pool.getRemoteToken(),
            amount: amount
        });

  // Construct CCIP message
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(destReceiver),
            data: abi.encode(burnParams), // this is the encoded LockOrBurnInV1
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200_000}) // adjust as needed
            ),
            feeToken: address(0) // native gas token
        });

 // Calculate fee
        uint256 fees = router.getFee(destinationChainSelector, message);

        return fees;

}


}