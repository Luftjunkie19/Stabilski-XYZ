// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {VaultManager} from "../src/VaultManager.sol";
import {CollateralManager} from "../src/CollateralManager.sol";
import {USDPLNOracle} from "../src/USDPLNOracle.sol";
import {StabilskiToken} from "../src/StabilskiToken.sol";
import {Test} from "../lib/forge-std/src/Test.sol";
import {DeployContracts} from "../script/DeployContracts.s.sol";
import {ERC20Mock} from "../src/interfaces/ERC20Mock.sol";
import {CCIPLocalSimulator, BurnMintERC677Helper, IERC20 } from "../lib/chainlink-local/src/ccip/CCIPLocalSimulator.sol";
import { TokenPool} from "../lib/ccip/contracts/src/v0.8/ccip/pools/BurnMintTokenPool.sol";
import {CCIPLocalSimulatorFork, Register} from "../lib/chainlink-local/src/ccip/CCIPLocalSimulatorFork.sol";
import { IRouterClient } from "../lib/ccip/contracts/src/v0.8/ccip/interfaces/IRouterClient.sol";
import{CCIPLocalSimulatorFork, Register} from "../lib/chainlink-local/src/ccip/CCIPLocalSimulatorFork.sol";
import { console } from "../lib/forge-std/src/console.sol";
import { Client } from "../lib/ccip/contracts/src/v0.8/ccip/libraries/Client.sol";
import {DeployStabilskiTokenPool} from '../script/ccip-contracts/DeployStabilskiTokenPoolProduction.s.sol';
import {RateLimiter} from "../lib/ccip/contracts/src/v0.8/ccip/libraries/RateLimiter.sol";

contract TestContract is Test {

uint256 sepoliaEthFork;
uint256 arbitrumSepoliaFork;
uint256 baseSepoliaFork;
CCIPLocalSimulator ccipLocalSimulator;


// Ethereum Sepolia contracts
VaultManager vaultManager;
StabilskiToken internal stabilskiToken;
USDPLNOracle usdPlnOracle;
CollateralManager collateralManager;

ERC20Mock sepoliaWETHMockToken;
ERC20Mock sepoliaWBTCMockToken;
ERC20Mock sepoliaWLINKMockToken;

// Arbitrum Sepolia contracts
VaultManager ArbitrumvaultManager;
StabilskiToken arbitrumstabilskiToken;
USDPLNOracle ArbitrumusdPlnOracle;
CollateralManager ArbitrumcollateralManager;
ERC20Mock arbitrumLINKMockToken;


// Base Sepolia Contracts
VaultManager baseSepoliaVaultManager;
StabilskiToken baseSepoliaStabilskiToken;
USDPLNOracle baseSepoliaPlnOracle;
CollateralManager baseSepoliaCollateralManager;
ERC20Mock baseLINKMockToken;
ERC20Mock baseWETHMockToken;


// Cross-chain management contracts (Ethereum Sepolia)
IRouterClient router;
uint64 sepoliaDestinationChainSelector;

// Cross-chain management contracts (Arbitrum Sepolia)
IRouterClient arbitrumRouter;
uint64 arbitrumChainSelector;

// Cross-chain management contracts (Base Sepolia)
IRouterClient baseRouter;
uint64 baseChainSelector;

CCIPLocalSimulatorFork ccipLocalSimulatorFork;

address borrower=makeAddr("borrower");
address liquidator=makeAddr("liquidator");

address wethInvalidAddress;

Register.NetworkDetails ethSepoliaNetworkDetails;
Register.NetworkDetails arbSepoliaNetworkDetails;
Register.NetworkDetails baseSepoliaNetworkDetails;

uint256 constant borrowTokenAmount = 1e19;
uint256 constant borrowWBTCAmount = 10e8;

TokenPool ethSepoliaStabilskiTokenPool;
TokenPool arbSepoliaStabilskiTokenPool;
TokenPool baseSepoliaStabilskiTokenPool;



function setUp() public {
// Estabilish 2 forks and select eth sepolia as the intial one.
sepoliaEthFork=vm.createSelectFork("ETH_SEPOLIA_RPC_URL");
arbitrumSepoliaFork=vm.createFork("ARB_SEPOLIA_RPC_URL");
baseSepoliaFork=vm.createFork("BASE_SEPOLIA_RPC_URL");

// Make the local simulator persistent
ccipLocalSimulator = new CCIPLocalSimulator();
vm.makePersistent(address(ccipLocalSimulator));

// Make the local simulator fork persistent
ccipLocalSimulatorFork = new CCIPLocalSimulatorFork();
vm.makePersistent(address(ccipLocalSimulatorFork));

// get the network details for the sepolia fork
   Register.NetworkDetails
            memory sourceNetworkDetails = ccipLocalSimulatorFork
                .getNetworkDetails(block.chainid);
        // Store the network details for the sepolia fork
               ethSepoliaNetworkDetails = sourceNetworkDetails;

// Set the router and link token for the sepolia fork
router = IRouterClient(sourceNetworkDetails.routerAddress);
sepoliaDestinationChainSelector = sourceNetworkDetails.chainSelector;

// set the invalid address to test the collateral.
wethInvalidAddress = vm.envAddress("SEPOLIA_ETH_WETH_ADDR");

address[] memory tokens;
address[] memory whitelist;
address[] memory priceFeeds;
uint256[] memory minCollateralRatios;

// Create the tokens
sepoliaWETHMockToken = new ERC20Mock("WETH", "WETH", borrower,liquidator, 1000e18, 18);
sepoliaWBTCMockToken = new ERC20Mock("WBTC", "WBTC", borrower,liquidator, 1000e8, 8);
sepoliaWLINKMockToken = new ERC20Mock("LINK", "LINK", borrower,liquidator, 1000e18, 18);

// Deploy the contracts on the sepolia eth fork.
tokens = new address[](3);
priceFeeds = new address[](3) ;
minCollateralRatios = new uint256[](3) ;
tokens[0]=address(sepoliaWBTCMockToken);
tokens[1]=address(sepoliaWETHMockToken);
tokens[2]=address(sepoliaWLINKMockToken);
priceFeeds[0]=vm.envAddress("ETH_BTC_USD");
priceFeeds[1]=vm.envAddress("ETH_ETH_USD");
priceFeeds[2]=vm.envAddress("ETH_LINK_USD");
minCollateralRatios[0]=135e16;
minCollateralRatios[1]=125e16;
minCollateralRatios[2]=12e17;


DeployContracts deployContracts = new DeployContracts();
(vaultManager, stabilskiToken, usdPlnOracle, collateralManager) = deployContracts.run(tokens, whitelist, priceFeeds, minCollateralRatios);

vm.makePersistent(address(usdPlnOracle));

vm.deal(borrower, 1000 ether);

// Switch to arbitrum fork
vm.selectFork(arbitrumSepoliaFork);

// Get the network details for the arbitrum fork
Register.NetworkDetails memory abitrumNetDetails = ccipLocalSimulatorFork.getNetworkDetails(block.chainid);
        arbitrumRouter = IRouterClient(abitrumNetDetails.routerAddress);
        arbitrumChainSelector= abitrumNetDetails.chainSelector;
        arbSepoliaNetworkDetails = abitrumNetDetails;

// Create the tokens
arbitrumLINKMockToken=new ERC20Mock("LINK", "LINK", borrower,liquidator, 1000 ether, 18);
tokens = new address[](1);
priceFeeds = new address[](1) ;
minCollateralRatios = new uint256[](1);

// deploy the contracts on the arbitrum fork
tokens[0]=address(arbitrumLINKMockToken);
priceFeeds[0]=vm.envAddress("ARBITRUM_LINK_USD_RATE");
minCollateralRatios[0]=12e17;


DeployContracts deployContractsArbitrum = new DeployContracts();
(ArbitrumvaultManager, arbitrumstabilskiToken, ArbitrumusdPlnOracle, ArbitrumcollateralManager) = deployContractsArbitrum.run(tokens, whitelist, priceFeeds, minCollateralRatios);

vm.selectFork(baseSepoliaFork);
// get the network details for the sepolia fork
   Register.NetworkDetails
            memory baseNetworkDetails = ccipLocalSimulatorFork
                .getNetworkDetails(block.chainid);
        // Store the network details for the sepolia fork
               baseSepoliaNetworkDetails = baseNetworkDetails;

// Set the router and link token for the sepolia fork
baseRouter = IRouterClient(baseNetworkDetails.routerAddress);
baseChainSelector = baseNetworkDetails.chainSelector;



tokens = new address[](2);
priceFeeds = new address[](2) ;
minCollateralRatios = new uint256[](2);

baseLINKMockToken = new ERC20Mock("LINK", "LINK", borrower,liquidator, 1000 ether, 18);
baseWETHMockToken = new ERC20Mock("WETH", "WETH", borrower,liquidator, 1000 ether, 18);


tokens[0]=address(baseLINKMockToken);
tokens[1]=address(baseWETHMockToken);

priceFeeds[0]=vm.envAddress("BASE_LINK_USD_RATE");
priceFeeds[1]=vm.envAddress("BASE_ETH_USD_RATE");

minCollateralRatios[0]=135e16;
minCollateralRatios[1]=14e17;

DeployContracts deployBaseSepoliaContracts = new DeployContracts();
(baseSepoliaVaultManager, baseSepoliaStabilskiToken, baseSepoliaPlnOracle, baseSepoliaCollateralManager) = deployBaseSepoliaContracts.run(tokens, whitelist, priceFeeds, minCollateralRatios);


vm.selectFork(sepoliaEthFork);
DeployStabilskiTokenPool deploySepoliaEthTokenPool = new DeployStabilskiTokenPool();
(ethSepoliaStabilskiTokenPool) = deploySepoliaEthTokenPool.run(
    address(stabilskiToken), msg.sender, 
    address(arbitrumstabilskiToken), address(baseSepoliaStabilskiToken), 
    ethSepoliaNetworkDetails.rmnProxyAddress,
    ethSepoliaNetworkDetails.routerAddress, arbitrumChainSelector, baseChainSelector,
    ethSepoliaNetworkDetails.tokenAdminRegistryAddress, ethSepoliaNetworkDetails.registryModuleOwnerCustomAddress
    );


vm.selectFork(baseSepoliaFork);
DeployStabilskiTokenPool deployBaseSepoliaTokenPool = new DeployStabilskiTokenPool();
(baseSepoliaStabilskiTokenPool)=deployBaseSepoliaTokenPool.run(
    address(baseSepoliaStabilskiToken), msg.sender, address(stabilskiToken), 
    address(arbitrumstabilskiToken), baseSepoliaNetworkDetails.rmnProxyAddress, 
    baseSepoliaNetworkDetails.routerAddress, ethSepoliaNetworkDetails.chainSelector, arbitrumChainSelector,
    baseSepoliaNetworkDetails.tokenAdminRegistryAddress, baseSepoliaNetworkDetails.registryModuleOwnerCustomAddress
    );


vm.selectFork(arbitrumSepoliaFork);
DeployStabilskiTokenPool deployArbitrumSepoliaTokenPool = new DeployStabilskiTokenPool();
(arbSepoliaStabilskiTokenPool)= deployArbitrumSepoliaTokenPool.run(
    address(arbitrumstabilskiToken), 
    msg.sender,
    address(stabilskiToken), 
    address(baseSepoliaStabilskiToken),
    arbSepoliaNetworkDetails.rmnProxyAddress,
    arbSepoliaNetworkDetails.routerAddress,
    ethSepoliaNetworkDetails.chainSelector,
    baseChainSelector,
    arbSepoliaNetworkDetails.tokenAdminRegistryAddress,
    arbSepoliaNetworkDetails.registryModuleOwnerCustomAddress
    );

vm.selectFork(sepoliaEthFork);
}

function testGetCollateralInfo() public {
vm.expectRevert();
(address priceInvaliedFeed,,,,) =  collateralManager.getCollateralInfo(address(0));

// Valid token

(address priceFeed,,,,) =  collateralManager.getCollateralInfo(address(sepoliaWBTCMockToken));

assertEq(priceFeed, vm.envAddress("ETH_BTC_USD"));

collateralManager.toggleCollateral(address(sepoliaWBTCMockToken));

vm.expectRevert();
(,,bool isActive,,) =  collateralManager.getCollateralInfo(address(sepoliaWBTCMockToken));


vm.expectRevert();
collateralManager.toggleCollateral(address(0));

vm.expectRevert();
collateralManager.getCollateralInfo(address(stabilskiToken));
}


function testIsCollateralListEmpty() public view {
assertGt(collateralManager.getCollateralTokens().length, 0);
}

function testGetPriceCollateral() public  {
address[] memory tokens = collateralManager.getCollateralTokens();
uint256 price = collateralManager.getTokenPrice(tokens[2]);

vm.expectRevert();
collateralManager.getTokenPrice(address(0));

assertGt(price, 1e17);
}

function testOracleCallsTheAPI() public  {

USDPLNOracle usdplnOracle = new USDPLNOracle(vm.envAddress("ARBITRUM_FUNCTIONS_ROUTER"), vm.envBytes32("ARBITRUM_DON_ID"), 407);

usdplnOracle.subscriptionId;
usdplnOracle.s_lastError;
usdplnOracle.s_lastFinalizationTimestamp;
usdplnOracle.s_subscriptionIds;

vm.expectRevert();
usdPlnOracle.fullfillExternalFlawed(
    bytes32(abi.encode("0x")),
    abi.encode(36555),
    bytes("0x")
);

usdplnOracle.getTheSource();
usdplnOracle.checkUpkeep(abi.encode("0x"));
usdplnOracle.performUpkeep(abi.encode("0x"));
usdplnOracle.fullfillExternalRequest(
    bytes32(abi.encode("0x")),
    abi.encode(36555),
    bytes("0x")
);

vm.warp(block.timestamp + usdplnOracle.interval());
assertGt(usdplnOracle.getPLNPrice(), 0);

}

function testDepositInvalidToken() public  {
vm.startPrank(borrower);
sepoliaWETHMockToken.approveInternal(address(vaultManager), borrowTokenAmount);
vm.expectRevert();
vaultManager.depositCollateral(address(
    wethInvalidAddress
), borrowTokenAmount);

vm.stopPrank();
}

function testDepositCollateral(uint256 amount) public  {

vm.assume(amount < sepoliaWETHMockToken.balanceOf(borrower) && amount > 0);

vm.startPrank(borrower);
uint256 userBalance=sepoliaWETHMockToken.balanceOf(borrower);
sepoliaWETHMockToken.approveInternal(address(vaultManager), amount);
vaultManager.depositCollateral(address(sepoliaWETHMockToken), amount);

assertEq(sepoliaWETHMockToken.balanceOf(borrower), userBalance - amount);
vm.stopPrank();

(uint256 collateralAmount, uint256 debt, address collateralToken, uint256 healthFactor)
= vaultManager.getVaultInfo(borrower, address(sepoliaWETHMockToken));

assertGt(collateralAmount, 0);
assertEq(debt, 0);
assertEq(collateralToken, address(sepoliaWETHMockToken));
assertGt(healthFactor, 0);

uint256 maxBorrowable =vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken));

uint256 vaultCollateralPLSTValue=vaultManager.getCollateralValue(borrower, address(sepoliaWETHMockToken));


assertLt(maxBorrowable, vaultCollateralPLSTValue);
}


function testDepositAndGetStabilskiTokens() public {
vm.startPrank(borrower);
sepoliaWETHMockToken.approveInternal(address(vaultManager), borrowTokenAmount);
vaultManager.depositCollateral(address(sepoliaWETHMockToken), borrowTokenAmount);

assertEq(stabilskiToken.balanceOf(borrower), 0);

assertGt(vaultManager.getCollateralValue(borrower, address(sepoliaWETHMockToken)), 0);
uint256 amountFlawed=vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken)) + 1;
vm.expectRevert();
vaultManager.mintPLST(address(sepoliaWETHMockToken), amountFlawed);

// Borrow 1000 PLST
uint256 amountToMint = 1000e18;

vaultManager.mintPLST(address(sepoliaWETHMockToken), amountToMint);

assertEq(stabilskiToken.balanceOf(borrower), amountToMint);

(,uint256 minimalHealthFactor,,,)=collateralManager.getCollateralInfo(address(sepoliaWETHMockToken));

assertGt(vaultManager.getVaultHealthFactor(borrower, address(sepoliaWETHMockToken)), minimalHealthFactor);

uint256 amountToRepay=stabilskiToken.balanceOf(borrower) / 2;

stabilskiToken.approve(address(vaultManager), amountToRepay);
vaultManager.repayPLST(address(sepoliaWETHMockToken), amountToRepay);
vm.stopPrank();

vm.startPrank(liquidator);
sepoliaWETHMockToken.approveInternal(address(vaultManager), 10e18);
vaultManager.depositCollateral(address(sepoliaWETHMockToken), 10e18);
vaultManager.mintPLST(address(sepoliaWETHMockToken), vaultManager.getMaxBorrowableStabilskiTokens(liquidator, address(sepoliaWETHMockToken)));

assertGt(stabilskiToken.balanceOf(liquidator), 0);

vm.expectRevert();
vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));

vm.stopPrank();

}

function testRepayAndWithdrawPartOfCollateral() public {
vm.startPrank(borrower);
sepoliaWETHMockToken.approveInternal(address(vaultManager), borrowTokenAmount);
vaultManager.depositCollateral(address(sepoliaWETHMockToken), borrowTokenAmount);
vaultManager.mintPLST(address(sepoliaWETHMockToken), vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken)));
uint256 stabilskiTokenBalanceBefore = stabilskiToken.balanceOf(borrower);
uint256 healthFactorBefore = vaultManager.getVaultHealthFactor(borrower, address(sepoliaWETHMockToken));

stabilskiToken.approve(address(vaultManager), stabilskiTokenBalanceBefore / 2);
vaultManager.repayPLST(address(sepoliaWETHMockToken), stabilskiTokenBalanceBefore / 2);

assertGt(stabilskiTokenBalanceBefore, stabilskiToken.balanceOf(borrower));
assertLt(healthFactorBefore, vaultManager.getVaultHealthFactor(borrower, address(sepoliaWETHMockToken)));

(uint256 collateralValue,,,) =  vaultManager.getVaultInfo(borrower, address(sepoliaWETHMockToken));

bool isHealthyAfterWithdrawal = vaultManager.getIsHealthyAfterWithdrawal(collateralValue, address(sepoliaWETHMockToken));

assertEq(isHealthyAfterWithdrawal, false);

vm.expectRevert();
vaultManager.withdrawCollateral(address(sepoliaWETHMockToken),collateralValue);
vm.stopPrank();

assertEq(sepoliaWETHMockToken.balanceOf(address(this)), 0);

vm.expectRevert();
vaultManager.depositCollateral(address(sepoliaWETHMockToken),borrowTokenAmount);

}

function testRevertLiquidation() public {
    vm.startPrank(borrower);
sepoliaWETHMockToken.approveInternal(address(vaultManager), borrowTokenAmount);
vaultManager.depositCollateral(address(sepoliaWETHMockToken), borrowTokenAmount);
vaultManager.mintPLST(address(sepoliaWETHMockToken), vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken)));
vm.stopPrank();

vm.startPrank(liquidator);
vm.expectRevert();
vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));
vm.stopPrank();
}

function testAddAndUpdateNewToken() public {
collateralManager.addCollateralType(address(sepoliaWBTCMockToken), vm.envAddress("ETH_BTC_USD"), 135e16, 4e18, 10);
collateralManager.updateCollateral(address(sepoliaWBTCMockToken), vm.envAddress("ETH_BTC_USD"), 125e16);

vm.expectRevert();
collateralManager.updateCollateral(address(stabilskiToken), vm.envAddress("ETH_BTC_USD"), 125e16);

vm.expectRevert();
collateralManager.updateCollateral(address(0), vm.envAddress("ETH_BTC_USD"), 125e16);

vm.expectRevert();
collateralManager.updateCollateral(address(stabilskiToken), address(0), 125e16);

vm.expectRevert();
collateralManager.updateCollateral(address(stabilskiToken), vm.envAddress("ETH_BTC_USD"), 0);
}

function testMintBurnPLSTProperties() public {

stabilskiToken.decimals();
stabilskiToken.getCCIPAdmin();
stabilskiToken.symbol();
stabilskiToken.totalSupply();
stabilskiToken.name();

    stabilskiToken.mint(address(borrower), borrowTokenAmount);

    vm.expectRevert();
    stabilskiToken.burn(address(borrower), borrowTokenAmount);

    vm.expectRevert();
    stabilskiToken.burnFrom(address(borrower), borrowTokenAmount);
  

    vm.startPrank(address(
        stabilskiToken.owner()
    ));
    stabilskiToken.grantControllerRole(borrower);

    stabilskiToken.mint(borrower, borrowTokenAmount);
    vm.stopPrank();

// Give approval from the borrower to vaultManager
vm.startPrank(borrower);
stabilskiToken.approve(address(vaultManager), borrowTokenAmount);
vm.stopPrank();

// Now vaultManager can burnFrom
vm.startPrank(address(vaultManager));
stabilskiToken.burnFrom(borrower, borrowTokenAmount);
vm.stopPrank();


vm.prank(borrower);
vm.expectRevert();
stabilskiToken.burnFrom(address(borrower), borrowTokenAmount);

vm.prank(stabilskiToken.owner());
stabilskiToken.transferOwnership(address(vaultManager));

vm.prank(address(vaultManager));
stabilskiToken.revokeControllerRole(address(borrower));

vm.expectRevert();
stabilskiToken.grantControllerRole(address(borrower));

vm.expectRevert();
stabilskiToken.revokeControllerRole(address(borrower));


}
function testMockERC20Functions() public {

vm.startPrank(borrower);
sepoliaWETHMockToken.mint(borrower, borrowTokenAmount);
sepoliaWETHMockToken.decimals();
sepoliaWETHMockToken.name();
sepoliaWETHMockToken.symbol();
sepoliaWETHMockToken.totalSupply();
vm.stopPrank();
}


function testLiqudationProcess() public {
vm.startPrank(borrower);
sepoliaWETHMockToken.approveInternal(address(vaultManager), borrowTokenAmount);
vaultManager.depositCollateral(address(sepoliaWETHMockToken), borrowTokenAmount);
vaultManager.mintPLST(address(sepoliaWETHMockToken), vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken)));

(, uint256 debt,,)=vaultManager.getVaultInfo(borrower, address(sepoliaWETHMockToken));



vm.expectRevert();
vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));

vm.stopPrank();



vm.startPrank(liquidator);
uint256 borrowerWethBalanceBeforeLiquidation = sepoliaWETHMockToken.balanceOf(borrower);
sepoliaWETHMockToken.approveInternal(address(vaultManager), borrowTokenAmount);
vaultManager.depositCollateral(address(sepoliaWETHMockToken), borrowTokenAmount);
uint256 amountToMint = vaultManager.getMaxBorrowableStabilskiTokens(liquidator, address(sepoliaWETHMockToken));
vaultManager.mintPLST(address(sepoliaWETHMockToken), amountToMint);
uint256 liquidatorWethBalanceBeforeLiquidation = sepoliaWETHMockToken.balanceOf(liquidator);


stabilskiToken.approve(address(vaultManager), debt);
vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));

assertEq(stabilskiToken.balanceOf(liquidator), 0);
assertGt(sepoliaWETHMockToken.balanceOf(liquidator), liquidatorWethBalanceBeforeLiquidation);
assertGt(sepoliaWETHMockToken.balanceOf(borrower), borrowerWethBalanceBeforeLiquidation);
vm.stopPrank();
}


function testProtocolFlowForWBTC() public {
vm.selectFork(sepoliaEthFork);

vm.startPrank(borrower);
sepoliaWBTCMockToken.approveInternal(address(vaultManager), borrowWBTCAmount);
vaultManager.depositCollateral(address(sepoliaWBTCMockToken), borrowWBTCAmount);

uint256 amountToMint = vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWBTCMockToken));

assert(amountToMint > 0);

vaultManager.mintPLST(address(sepoliaWBTCMockToken), amountToMint);

assertEq(stabilskiToken.balanceOf(borrower), amountToMint);

vm.stopPrank();

}


function testCCIPTransferFromSepoliaETHtoBaseSepolia() public {
    address linkSepolia = ethSepoliaNetworkDetails.linkAddress;
        ccipLocalSimulatorFork.requestLinkFromFaucet(address(borrower), 200 ether);

        uint256 amountToSend = 5e18;
        Client.EVMTokenAmount[] memory tokenToSendDetails = new Client.EVMTokenAmount[](1);
        Client.EVMTokenAmount memory tokenAmount =
            Client.EVMTokenAmount({token: address(stabilskiToken), amount: 1e18});
        tokenToSendDetails[0] = tokenAmount;

        stabilskiToken.mint(address(borrower), amountToSend);
        vm.startPrank(borrower);
        stabilskiToken.approve(ethSepoliaNetworkDetails.routerAddress, 1e18);
        IERC20(linkSepolia).approve(ethSepoliaNetworkDetails.routerAddress, 200 ether);

uint256 balanceBeforeTx= stabilskiToken.balanceOf(borrower);

        IRouterClient routerEthSepolia = IRouterClient(ethSepoliaNetworkDetails.routerAddress);

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
                receiver: abi.encode(address(borrower)),
                data: "",
                tokenAmounts: tokenToSendDetails,
                extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 0})),
                feeToken: address(0)
            });

            uint256 feesToPay = routerEthSepolia.getFee(baseChainSelector, message);


     bytes32 messageId = routerEthSepolia.ccipSend{value:feesToPay}(
            baseChainSelector,message
        );


        uint256 balanceAfterTx = stabilskiToken.balanceOf(borrower);

        assertEq(balanceAfterTx,  balanceBeforeTx - 1e18);
        
    
    ccipLocalSimulatorFork.switchChainAndRouteMessage(baseSepoliaFork);

        uint256 balanceOfAfterBaseSepolia = baseSepoliaStabilskiToken.balanceOf(borrower);
        assertEq(balanceOfAfterBaseSepolia, amountToSend);

}



}