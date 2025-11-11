// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {StabilskiToken} from "../src/StabilskiToken.sol";
import {IRouterClient} from "../lib/ccip/contracts/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { Client } from "../lib/ccip/contracts/src/v0.8/ccip/libraries/Client.sol";

contract CcipSender {

error NotEnoughBalance(uint256 balance, uint256 amountToSend);
error FailedApproval();

IRouterClient router;
StabilskiToken sourceStabilskiToken;

constructor(address routerAddress, address stabilskiTokenAddress){
sourceStabilskiToken = StabilskiToken(stabilskiTokenAddress);
router = IRouterClient(routerAddress);    

}

function sendCcipMessage(uint256 amountToSend, uint64 destinationChainSelector) external returns(bytes32){

uint256 balance= sourceStabilskiToken.balanceOf(msg.sender);

if(balance < amountToSend){
    revert NotEnoughBalance(balance, amountToSend);
}

(bool approved) = sourceStabilskiToken.approve(address(router), amountToSend);

if(!approved){
    revert FailedApproval();
}

Client.EVMTokenAmount[] memory tokenToSendDetails = new Client.EVMTokenAmount[](1);

Client.EVMTokenAmount memory tokenAmount =
            Client.EVMTokenAmount({token: address(sourceStabilskiToken), amount: amountToSend});
        tokenToSendDetails[0] = tokenAmount;


Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
                receiver: abi.encode(address(msg.sender)),
                data: "",
                tokenAmounts: tokenToSendDetails,
                extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 0})),
                feeToken: address(0)
            });

uint256 feesToPay = router.getFee(destinationChainSelector, message);


     bytes32 messageId = router.ccipSend{value:feesToPay}(
            destinationChainSelector,message
        );

        return messageId;

}


function getFeesToPay(uint64 destinationChainSelector,uint256 amountToSend) external view returns (uint256) {
Client.EVMTokenAmount[] memory tokenToSendDetails = new Client.EVMTokenAmount[](1);

Client.EVMTokenAmount memory tokenAmount =
            Client.EVMTokenAmount({token: address(sourceStabilskiToken), amount: amountToSend});
        tokenToSendDetails[0] = tokenAmount;


Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
                receiver: abi.encode(address(msg.sender)),
                data: "",
                tokenAmounts: tokenToSendDetails,
                extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 5000000})),
                feeToken: address(0)
            });

uint256 feesToPay = router.getFee(destinationChainSelector, message);

return feesToPay;

}


}