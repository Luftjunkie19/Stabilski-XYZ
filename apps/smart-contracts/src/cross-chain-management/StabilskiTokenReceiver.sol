// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {CCIPReceiver} from "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {StabilskiTokenPool} from "../pools/StabilskiTokenPool.sol";
import {Pool}  from "../../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/libraries/Pool.sol";
import {StabilskiTokenInterface} from "../interfaces/StabilskiTokenInterface.sol";
contract StabilskiTokenReceiver is CCIPReceiver    {

error UnauthorizedSender(address sender);

  event MessageReceived(
        bytes32 indexed messageId,
        uint64 sourceChainSelector,
        address sender,
        bytes data
    );

StabilskiTokenPool destinationStabilskiPool;
StabilskiTokenInterface destinationStabilskiToken;
address sourcePoolAddress;

bytes32 messageId; // MessageId corresponding to ccipSend on source.
    uint64 sourceChainSelector; // Source chain selector.
    address sender; // abi.decode(sender) if coming from an EVM chain.
    bytes data; // payload sent in original message.
    Client.EVMTokenAmount[] destTokenAmounts;
constructor(address router, address _destinationStabilskiPool, address _sourceStabilskiPool, address _destinationStabilskiToken) CCIPReceiver(router){
    destinationStabilskiPool = StabilskiTokenPool(_destinationStabilskiPool);
    sourcePoolAddress=_sourceStabilskiPool;
    destinationStabilskiToken = StabilskiTokenInterface(_destinationStabilskiToken);
}

function ccipReceive(Client.Any2EVMMessage calldata message) external virtual override onlyRouter{
    _ccipReceive(message);
}

   function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override onlyRouter {
      sourceChainSelector= message.sourceChainSelector;
      messageId = message.messageId;
      sender = abi.decode(message.sender, (address));
      data = message.data;
      destTokenAmounts = message.destTokenAmounts;


      if (sender != sourcePoolAddress) {
        revert UnauthorizedSender(sender);
      }

      Pool.ReleaseOrMintInV1 memory releaseOrMintIn = abi.decode(data, (Pool.ReleaseOrMintInV1));

     Pool.ReleaseOrMintOutV1 memory releaseOrMintOut = destinationStabilskiPool.releaseOrMint(releaseOrMintIn);
     destinationStabilskiToken.mint(releaseOrMintIn.receiver, releaseOrMintOut.destinationAmount);
emit MessageReceived(message.messageId, message.sourceChainSelector, sender, message.data);

 messageId = bytes32("");
     sourceChainSelector=0;
     sender = address(0);
     data = bytes("");
     destTokenAmounts = new Client.EVMTokenAmount[](0);

    }

    function getRouter() public view virtual override returns (address){
      return super.getRouter();
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool){
      return super.supportsInterface(interfaceId);
    }

}