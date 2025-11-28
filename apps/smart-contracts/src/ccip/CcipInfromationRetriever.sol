// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Client } from "../../lib/ccip/contracts/src/v0.8/ccip/libraries/Client.sol";
import {StabilskiToken} from '../StabilskiToken.sol';
import { IRouterClient } from "../../lib/ccip/contracts/src/v0.8/ccip/interfaces/IRouterClient.sol";

import {USDPLNOracleInterface} from "../interfaces/USDPLNOracleInterface.sol";

import {CollateralManagerInterface} from "../interfaces/CollateralManagerInterface.sol";

contract InformationCCIPRetriever{

error TooLowValueProvider(uint256 providedFee, uint256 requiredFee);

error NotEnoughAllowance(uint256 providedAllowance, uint256 requiredAllowance);

error FailedTransferToProtocol();

uint256 immutable gasLimit;
address constant zeroAddress=address(0);

uint256 constant PROTOCOL_FEE_BPS = 25;
uint256 constant BPS_DENOMINATOR = 10000;

StabilskiToken immutable sourceStabilskiToken;
IRouterClient immutable router;
address payable private immutable feesReceivingAddress;
USDPLNOracleInterface immutable usdPlnOracle;
uint256 constant usdPlnRateDecimalPoints = 1e4;
uint256 constant ethUsdRateDecimalPoints = 1e18;
CollateralManagerInterface immutable collateralManager;
address immutable ethUsdPriceFeedAddress;



<<<<<<< HEAD
constructor(address stabilskiSourceAddress, address routerAddress,
 address feesReceiver, address usdPlnOracleAddress, address collateralManagerAddress,
=======
constructor(address stabilskiSourceAddress, address routerAddress, address feesReceiver, address usdPlnOracleAddress, address collateralManagerAddress,
>>>>>>> main/main
    address _ethUsdPriceFeedAddress) {
    router = IRouterClient(routerAddress);
    sourceStabilskiToken = StabilskiToken(stabilskiSourceAddress);
    gasLimit = 500000;
    feesReceivingAddress = payable(feesReceiver);
    usdPlnOracle = USDPLNOracleInterface(usdPlnOracleAddress);
    collateralManager = CollateralManagerInterface(collateralManagerAddress);
    ethUsdPriceFeedAddress = _ethUsdPriceFeedAddress;
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

function getCcipTotalFees(address receiverAddress, uint256 amountToSend, uint64 destinationSelector) public view returns (uint256, uint256) {
Client.EVM2AnyMessage memory ccipMessage = getCcipMessage(receiverAddress, amountToSend);

// fees to be paid for ccip
uint256 feesToPay = router.getFee(destinationSelector, ccipMessage);

// protocol fees to be paid

// 1. Get USDPLN rate from oracle
uint256 plnUsdRate = usdPlnOracle.getPLNPrice(); 

// 2/ Get ETHUSD rate from CollateralManager
<<<<<<< HEAD
uint256 ethUsdPrice = collateralManager.getTokenPriceFromPriceFeed(ethUsdPriceFeedAddress);
=======
uint256 ethUsdPrice = collateralManager.getTokenPrice(ethUsdPriceFeedAddress);
>>>>>>> main/main

// 3. Calculate USD amount to be sent from sent PLN amount
uint256 usdAmount = (amountToSend * usdPlnRateDecimalPoints) / plnUsdRate;

// 4. Calculate ETH amount to be sent
uint256 ethAmount = (usdAmount * ethUsdRateDecimalPoints) / ethUsdPrice;

// 5. Calculate protocol fees in ETH
uint256 protocolFeesToPay = (ethAmount * PROTOCOL_FEE_BPS) / BPS_DENOMINATOR;


return (feesToPay, protocolFeesToPay);

}

function sendCcipMessage(address receiverAddress, uint256 amountToSend, uint64 destinationSelector) external payable returns (bytes32) {

<<<<<<< HEAD
uint256 allowance = sourceStabilskiToken.allowance(msg.sender, address(this));


if(allowance < amountToSend){
    revert NotEnoughAllowance(allowance, amountToSend);
}

(bool successTransfer) = sourceStabilskiToken.transferFrom(msg.sender, address(this), amountToSend);

if(!successTransfer){
    revert FailedTransferToProtocol();
}

(bool approved) = sourceStabilskiToken.approve(address(router), amountToSend);

if(!approved){
    revert FailedTransferToProtocol();
}

=======
>>>>>>> main/main
Client.EVM2AnyMessage memory ccipMessage = getCcipMessage(receiverAddress, amountToSend);

(uint256 networkFees, uint256 protocolFees)= getCcipTotalFees(receiverAddress, amountToSend, destinationSelector);

uint256 totalFees = networkFees + protocolFees;

if(totalFees > msg.value){
revert TooLowValueProvider(msg.value, totalFees);
}

bytes32 messageId =  router.ccipSend{value:networkFees}(destinationSelector, ccipMessage);

(bool success,) = feesReceivingAddress.call{value:protocolFees}("");

if(!success){
    revert FailedTransferToProtocol();
}

return messageId;
}




}