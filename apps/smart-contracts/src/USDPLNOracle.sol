// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {FunctionsClient} from "../lib/chainlink-brownie-contracts/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "../lib/chainlink-brownie-contracts/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "../lib/chainlink-brownie-contracts/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {AutomationCompatibleInterface} from "../lib/chainlink-brownie-contracts/contracts/src/v0.8/automation/AutomationCompatible.sol";
contract USDPLNOracle is FunctionsClient, ConfirmedOwner, AutomationCompatibleInterface  {
using FunctionsRequest for FunctionsRequest.Request;

error InvalidUSDPLNRate();
  // State variables to store the last request ID, response, and error
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;
    uint256 public s_lastFinalizationTimestamp;
    // Custom error type
    error UnexpectedRequestID(bytes32 requestId);

  event Response(
        bytes32 indexed requestId,
        uint256 plnUsdRate,
        bytes response,
        bytes err
    );

    uint32 gasLimit = 300_000;
    bytes32 donID;
    uint256 public plnUsdRate;
    uint256 public lastTimeStamp;
    uint256 public constant interval = 1 days; // 1 day in seconds


    string private source = string(
        abi.encodePacked(
            "const apiResponse = await Functions.makeHttpRequest({ url: \"https://api.nbp.pl/api/exchangerates/rates/a/usd/?format=json\" });",
            "if (apiResponse.error) { throw new Error(apiResponse.error); }",
            "const { data } = apiResponse;",
            "return Functions.encodeUint256(Math.round(Number(data.rates[0].mid) * 10000));"
        )
    );

mapping(bytes32 donID => uint256 subscriptionId) public s_subscriptionIds;

    // Subscription ID for the Chainlink Functions subscription
    uint64 public subscriptionId;


constructor(address router, bytes32 _donID, uint64 _subscriptionId) FunctionsClient(router) ConfirmedOwner(msg.sender) {
    donID = _donID;
    lastTimeStamp = block.timestamp;
    subscriptionId = _subscriptionId;
    s_subscriptionIds[_donID] = subscriptionId;
}

modifier onlyValidPLNUSDRate() {
   if ((plnUsdRate < 1e4) ||  (block.timestamp - s_lastFinalizationTimestamp > interval * 2)) {
        revert InvalidUSDPLNRate();
    }
    _;
}

 function sendRequest() public returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source); 
        // Send the request and store the request ID
        s_lastRequestId = _sendRequest(
        req.encodeCBOR(), 
        subscriptionId,
            gasLimit,
            donID
        );
        lastTimeStamp = block.timestamp;
        return s_lastRequestId;
    }



    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        upkeepNeeded = (block.timestamp - lastTimeStamp) > interval;    
    }

 function performUpkeep(bytes calldata /* performData */) external override {
        if ((block.timestamp - lastTimeStamp) >= interval) {
            lastTimeStamp = block.timestamp;
            sendRequest(); // Call the sendRequest function to initiate the request
        }
    }

    // For testing purposes only

    // function fullfillExternalRequest(
    //     bytes32 requestId,
    //     bytes memory response,
    //     bytes memory err
    // ) external {
    //     s_lastRequestId = requestId;
    //     fulfillRequest(requestId, response, err);
    // }

    // function fullfillExternalFlawed(
    //     bytes32 requestId,
    //     bytes memory response,
    //     bytes memory err
    // ) external {
    //     fulfillRequest(requestId, response, err);
    // }

 function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId); // Check if request IDs match
        }
        // Update the contract's state variables with the response and any errors
        s_lastResponse = response;
        plnUsdRate = abi.decode(response, (uint256));
        s_lastError = err;
        s_lastFinalizationTimestamp = block.timestamp;

        // Emit an event to log the response
        emit Response(requestId, plnUsdRate, s_lastResponse, s_lastError);
    }

function getTheSource() public view returns (string memory) {
    return source;
}

function getPLNPrice() public view onlyValidPLNUSDRate returns  (uint256) {
    return plnUsdRate;
}
}