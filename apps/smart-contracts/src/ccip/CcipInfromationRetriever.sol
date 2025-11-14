// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Client } from "../../lib/ccip/contracts/src/v0.8/ccip/libraries/Client.sol";
import {StabilskiToken} from '../StabilskiToken.sol';
import { IRouterClient } from "../../lib/ccip/contracts/src/v0.8/ccip/interfaces/IRouterClient.sol";

contract InformationCCIPRetriever{

uint256 immutable gasLimit;
address constant zeroAddress=address(0);

StabilskiToken sourceStabilskiToken;
IRouterClient router;

constructor(address stabilskiSourceAddress, address routerAddress){
    router = IRouterClient(routerAddress);
    sourceStabilskiToken = StabilskiToken(stabilskiSourceAddress);
    if(block.chainid == 11155111){
        gasLimit=0;
    }else{
        gasLimit = 500000;
    }
}

function getCcipMessage(address receiverAddress, uint256 amountToSend) public view returns (Client.EVM2AnyMessage memory){
      Client.EVMTokenAmount[] memory tokenToSendDetails = new Client.EVMTokenAmount[](1);
        Client.EVMTokenAmount memory tokenAmount =
            Client.EVMTokenAmount({token: address(sourceStabilskiToken), amount: amountToSend});
        tokenToSendDetails[0] = tokenAmount;


        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
                receiver: abi.encode(address(receiverAddress)),
                data: "0x",
                tokenAmounts: tokenToSendDetails,
                extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit:gasLimit})),
                feeToken: zeroAddress
            });

        return message;
}

function getCCIPMessageFee(address receiverAddress, uint256 amountToSend, uint64 destinationSelector) public view returns (uint256) {
Client.EVM2AnyMessage memory ccipMessage = getCcipMessage(receiverAddress, amountToSend);

uint256 feesToPay = router.getFee(destinationSelector, ccipMessage);

return feesToPay;

}




}