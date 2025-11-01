// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {Client} from "../../lib/ccip/contracts/src/v0.8/ccip/libraries/Client.sol";
import {
    IRouterClient
} from "../../lib/ccip/contracts/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {StabilskiTokenInterface} from "../interfaces/StabilskiTokenInterface.sol";
import {StabilskiTokenPool} from "../pools/StabilskiTokenPool.sol";
import {StabilskiToken} from "../StabilskiToken.sol";
import {Pool}  from "../../lib/ccip/contracts/src/v0.8/ccip/libraries/Pool.sol";
import { IERC20 } from "../../lib/ccip/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/extensions/ERC20Burnable.sol";
contract StabilskiTokenSender {
  error InsufficientFunds();

    StabilskiTokenPool public pool;
    address public owner;
    IRouterClient public router;

    constructor(address _router, address _pool) {
        owner = msg.sender;
        router = IRouterClient(_router);
        pool = StabilskiTokenPool(_pool);
    }
function bridgeTokens(
    address sourceToken,
    uint64 destinationChainSelector,
    address destinationToken,
        address destReceiver, // address on destination chain
        uint256 amount,
        address linkSepoliaToken
        ) external payable {
           (bool approved) = StabilskiToken(sourceToken).approve(address(this), amount);

        if (!approved) revert InsufficientFunds();
// Create LockOrBurnInV1 struct
        Pool.LockOrBurnInV1 memory burnParams = Pool.LockOrBurnInV1({
            originalSender: address(this),
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
            data: abi.encode(burnParams), 
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 0})),
            feeToken: linkSepoliaToken
        });


 // Calculate fee
        uint256 fees = router.getFee(destinationChainSelector, message);
        if (msg.value < fees) revert InsufficientFunds();

        // Send via CCIP
      (bytes32 ccipSentMessageReturn) = router.ccipSend{value: fees}(destinationChainSelector, message);

}

function getFee(
    address sourceToken,
     uint64 destinationChainSelector, address destinationToken, address destReceiver,
     uint256 amount,
address linkSepoliaToken
)
      public  returns (uint256){
    
    StabilskiToken(sourceToken).approve(address(this), amount);
    
    Pool.LockOrBurnInV1 memory burnParams = Pool.LockOrBurnInV1({
            originalSender: address(this),
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
                 extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 0})),
            feeToken: linkSepoliaToken
        });

 // Calculate fee
        uint256 fees = router.getFee(destinationChainSelector, message);

        return fees;

}


}