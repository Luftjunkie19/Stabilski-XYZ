// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface USDPLNOracleInterface {
    
 event Response(
        bytes32 indexed requestId,
        uint256 plnUsdRate,
        bytes response,
        bytes err
    );

    error UnexpectedRequestID(bytes32 requestId);

 function sendRequest( uint64 subscriptionId) external returns (bytes32 requestId);

function checkUpkeep(bytes calldata /* checkData */) external view returns (bool upkeepNeeded, bytes memory /* performData */);

 function performUpkeep(bytes calldata /* performData */) external;

 function fulfillRequest(bytes32 requestId, bytes calldata response, bytes memory err) external;

function getPLNPrice() external view returns (uint256);
}