// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {VaultManager} from "../src/VaultManager.sol";
import {CollateralManager} from "../src/CollateralManager.sol";
import {USDPLNOracle} from "../src/USDPLNOracle.sol";
import {StabilskiToken} from "../src/StabilskiToken.sol";
import {Test} from "../lib/forge-std/src/Test.sol";
import {DeployContracts} from "../script/DeployTestContracts.s.sol";
import {ERC20Mock} from "../src/interfaces/ERC20Mock.sol";
import {CCIPLocalSimulator, BurnMintERC677Helper, IERC20 } from "../lib/chainlink-local/src/ccip/CCIPLocalSimulator.sol";
import { TokenPool} from "../lib/ccip/contracts/src/v0.8/ccip/pools/BurnMintTokenPool.sol";
import {CCIPLocalSimulatorFork, Register} from "../lib/chainlink-local/src/ccip/CCIPLocalSimulatorFork.sol";
import { IRouterClient } from "../lib/ccip/contracts/src/v0.8/ccip/interfaces/IRouterClient.sol";
import{CCIPLocalSimulatorFork, Register} from "../lib/chainlink-local/src/ccip/CCIPLocalSimulatorFork.sol";
import { console } from "../lib/forge-std/src/console.sol";
import { Client } from "../lib/ccip/contracts/src/v0.8/ccip/libraries/Client.sol";

import {RateLimiter} from "../lib/ccip/contracts/src/v0.8/ccip/libraries/RateLimiter.sol";
import {BurnMintTokenPool} from "../lib/ccip/contracts/src/v0.8/ccip/pools/BurnMintTokenPool.sol";
import {DeployStabilskiTokenPool} from '../script/ccip-contracts/test/DeployStabilskiPoolTest.s.sol';

import {InformationCCIPRetriever} from "../src/ccip/CcipInfromationRetriever.sol";
import {DeployTestCcipRetriever} from "../script/ccip-contracts/test/DeployTestCcipRetriever.s.sol";

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
address feesReceiver=makeAddr("feesReceiver");

address wethInvalidAddress;

Register.NetworkDetails ethSepoliaNetworkDetails;
Register.NetworkDetails arbSepoliaNetworkDetails;
Register.NetworkDetails baseSepoliaNetworkDetails;

uint256 constant borrowTokenAmount = 1e19;
uint256 constant borrowWBTCAmount = 10e8;

TokenPool ethSepoliaStabilskiTokenPool;
TokenPool arbSepoliaStabilskiTokenPool;
TokenPool baseSepoliaStabilskiTokenPool;


InformationCCIPRetriever ethCcipRetriever;
InformationCCIPRetriever arbCcipRetriever;
InformationCCIPRetriever baseCcipRetriever;


// Function to be used only to apply specifc chains to certain pool, testing ccip transfers

function applyChain(address sourceTokenPool, address firstRemoteTokenPool, address secondRemoteTokenPool,

address firstRemoteToken, address secondRemoteToken, uint64 firstRemoteChainSelector, uint64 secondRemoteChainSelector
) private {

BurnMintTokenPool tokenPool = BurnMintTokenPool(sourceTokenPool);

 // ChainUpdates + chain configurations etc.
        TokenPool.ChainUpdate[] memory chains = new TokenPool.ChainUpdate[](2);
      
        
        chains[0] = TokenPool.ChainUpdate({
            remoteChainSelector: firstRemoteChainSelector,
            remotePoolAddress: abi.encode(address(firstRemoteTokenPool)),
            allowed:true,
            remoteTokenAddress: abi.encode(firstRemoteToken),
            outboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 1e24, rate: 167}),
            inboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 1e24, rate: 167})
        });

          chains[1] = TokenPool.ChainUpdate({
            remoteChainSelector: secondRemoteChainSelector,
            remotePoolAddress: abi.encode(address(secondRemoteTokenPool)),
            allowed:true,
            remoteTokenAddress: abi.encode(secondRemoteToken),
            outboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 1e24, rate: 167}),
            inboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 1e24, rate: 167})
        });
        
        
        TokenPool(address(tokenPool)).applyChainUpdates(chains);
}



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
minCollateralRatios[2]=135e16;


DeployContracts deployContracts = new DeployContracts();
(vaultManager, stabilskiToken, usdPlnOracle, collateralManager) = deployContracts.run(tokens, whitelist, priceFeeds, minCollateralRatios, feesReceiver);

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
minCollateralRatios[0]=135e16;


DeployContracts deployContractsArbitrum = new DeployContracts();
(ArbitrumvaultManager, arbitrumstabilskiToken, ArbitrumusdPlnOracle, ArbitrumcollateralManager) = deployContractsArbitrum.run(tokens, whitelist, priceFeeds, minCollateralRatios, feesReceiver);


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
(baseSepoliaVaultManager, baseSepoliaStabilskiToken, baseSepoliaPlnOracle, baseSepoliaCollateralManager) = deployBaseSepoliaContracts.run(tokens, whitelist, priceFeeds, minCollateralRatios, feesReceiver);


vm.selectFork(sepoliaEthFork);
DeployStabilskiTokenPool deploySepoliaEthTokenPool = new DeployStabilskiTokenPool();
(ethSepoliaStabilskiTokenPool) = deploySepoliaEthTokenPool.run(
    address(stabilskiToken), msg.sender,
    ethSepoliaNetworkDetails.rmnProxyAddress,
    ethSepoliaNetworkDetails.routerAddress,
    ethSepoliaNetworkDetails.tokenAdminRegistryAddress, ethSepoliaNetworkDetails.registryModuleOwnerCustomAddress
    );


vm.selectFork(baseSepoliaFork);
DeployStabilskiTokenPool deployBaseSepoliaTokenPool = new DeployStabilskiTokenPool();
(baseSepoliaStabilskiTokenPool)=deployBaseSepoliaTokenPool.run(
    address(baseSepoliaStabilskiToken), msg.sender,baseSepoliaNetworkDetails.rmnProxyAddress, 
    baseSepoliaNetworkDetails.routerAddress,
    baseSepoliaNetworkDetails.tokenAdminRegistryAddress, baseSepoliaNetworkDetails.registryModuleOwnerCustomAddress
    );


vm.selectFork(arbitrumSepoliaFork);
DeployStabilskiTokenPool deployArbitrumSepoliaTokenPool = new DeployStabilskiTokenPool();
(arbSepoliaStabilskiTokenPool)= deployArbitrumSepoliaTokenPool.run(
    address(arbitrumstabilskiToken), 
    msg.sender,
    arbSepoliaNetworkDetails.rmnProxyAddress,
    arbSepoliaNetworkDetails.routerAddress,
    arbSepoliaNetworkDetails.tokenAdminRegistryAddress,
    arbSepoliaNetworkDetails.registryModuleOwnerCustomAddress
    );


vm.selectFork(sepoliaEthFork);
DeployTestCcipRetriever ethDeployEthRetriever = new DeployTestCcipRetriever();
ethCcipRetriever= ethDeployEthRetriever.run(address(stabilskiToken), ethSepoliaNetworkDetails.routerAddress,
feesReceiver, address(usdPlnOracle),address(collateralManager), vm.envAddress("ETH_ETH_USD")
);

vm.selectFork(arbitrumSepoliaFork);
DeployTestCcipRetriever arbDeployRetriever = new DeployTestCcipRetriever();
arbCcipRetriever= arbDeployRetriever.run(address(arbitrumstabilskiToken), arbSepoliaNetworkDetails.routerAddress,
feesReceiver, address(ArbitrumusdPlnOracle),address(ArbitrumcollateralManager), vm.envAddress("ARB_ETH_USD_RATE")
);

vm.selectFork(baseSepoliaFork);
DeployTestCcipRetriever baseDeployRetriever = new DeployTestCcipRetriever();
baseCcipRetriever = baseDeployRetriever.run(address(baseSepoliaStabilskiToken), baseNetworkDetails.routerAddress,
feesReceiver, address(baseSepoliaPlnOracle),address(baseSepoliaCollateralManager), vm.envAddress("BASE_ETH_USD_RATE")
);


vm.selectFork(sepoliaEthFork);

}

function testGetCollateralInfo(address collateralToken, address priceFeedAddress) public {

// Set requirements for fuzzing
vm.assume(collateralToken != address(0));
vm.assume(priceFeedAddress != address(0));

// Commit actions as the collateralManager
vm.startPrank(collateralManager.getTheCollateralManagerOwner());
vm.expectRevert();
(address priceInvaliedFeed,,,,) =  collateralManager.getCollateralInfo(address(0));

// Valid token

(address priceFeed,,,,) =  collateralManager.getCollateralInfo(address(sepoliaWBTCMockToken));

assertEq(priceFeed, vm.envAddress("ETH_BTC_USD"));

// Toggle collaterization accessibility
collateralManager.toggleCollateral(address(sepoliaWBTCMockToken));

(,,bool isActive,,) =  collateralManager.getCollateralInfo(address(sepoliaWBTCMockToken));

assertEq(isActive, false);


// Check if can toggle non-existing collateral-option
vm.expectRevert();
collateralManager.toggleCollateral(address(0));

vm.expectRevert();
collateralManager.getCollateralInfo(collateralToken);

// Check if reverts on collateral with invalid params (too low collateralization ratio)

vm.expectRevert();
collateralManager.addCollateralType(address(collateralToken), address(priceFeedAddress), 1e12, 12, 5);

vm.expectRevert();
collateralManager.updateCollateral(address(collateralToken), address(priceFeedAddress), 13e17);

// Add new collateral and check if reverts on too low collaterization rate.

collateralManager.addCollateralType(address(collateralToken), address(priceFeedAddress), 13e17, 12, 5);

vm.expectRevert();
collateralManager.updateCollateral(address(collateralToken), address(priceFeedAddress), 10e17);

// Add already exsiting collateral, fails
vm.expectRevert();
collateralManager.addCollateralType(address(collateralToken), address(priceFeedAddress), 13e17, 12, 5);

vm.stopPrank();

// Check if outsiders can toggle or update and get token price that doesn't exist.
vm.expectRevert();
collateralManager.addCollateralType(address(collateralToken), address(priceFeedAddress), 13e17, 12, 5);

vm.expectRevert();
collateralManager.updateCollateral(address(collateralToken), address(priceFeedAddress), 10e17);

vm.expectRevert();
collateralManager.getTokenPrice(address(0));


// Get all tokens, select one of them and check if the price is not zero/larger than 0.1$ per unit (extremely small)
address[] memory tokens = collateralManager.getCollateralTokens();
uint256 price = collateralManager.getTokenPrice(tokens[2]);

vm.expectRevert();
collateralManager.getTokenPrice(address(0));

assertGt(price, 1e17);
assertGt(tokens.length, 0);

}



// Tested to keep test rate up
function testOracleCallsTheAPI() public  {

USDPLNOracle usdplnOracle = new USDPLNOracle(vm.envAddress("ARBITRUM_FUNCTIONS_ROUTER"), vm.envBytes32("ARBITRUM_DON_ID"), 407);

usdplnOracle.subscriptionId;
usdplnOracle.s_lastError;
usdplnOracle.s_lastFinalizationTimestamp;
usdplnOracle.s_subscriptionIds;

usdplnOracle.getTheSource();
usdplnOracle.checkUpkeep(abi.encode("0x"));
usdplnOracle.performUpkeep(abi.encode("0x"));

vm.warp(block.timestamp + usdplnOracle.interval());
vm.expectRevert();
usdplnOracle.getPLNPrice();

}

// Test if reverts on trying to deposit on invalid collateral-token address
function testDepositInvalidToken() public  {
vm.startPrank(borrower);
sepoliaWETHMockToken.approve(address(vaultManager), borrowTokenAmount);
vm.expectRevert();
vaultManager.depositCollateral(address(
    wethInvalidAddress
));

vm.stopPrank();
}

// Test of Depositing collateral
function testMaxBorrowableLesserThanCollateral(uint256 amount) public  {
// Keeping the conditions for fuzzing
vm.assume(amount < sepoliaWETHMockToken.balanceOf(borrower) && amount > 0);

vm.startPrank(borrower);
//Retrieve WETH amount, approval and deposit
uint256 userBalance=sepoliaWETHMockToken.balanceOf(borrower);
sepoliaWETHMockToken.approveInternal(address(vaultManager), amount);
vaultManager.depositCollateral(address(sepoliaWETHMockToken));

// Asserting if deposit successfully has been commited
assertEq(sepoliaWETHMockToken.balanceOf(borrower), userBalance - amount);
vm.stopPrank();

// Get info on the collateral amount
(uint256 collateralAmount, uint256 debt, address collateralToken, uint256 healthFactor)
= vaultManager.getVaultInfo(borrower, address(sepoliaWETHMockToken));

assertGt(collateralAmount, 0);
assertEq(debt, 0);
assertEq(collateralToken, address(sepoliaWETHMockToken));
assertGt(healthFactor, 0);


// Check if the collateral is greater than maxBorrowable
uint256 maxBorrowable =vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken));

uint256 vaultCollateralPLSTValue=vaultManager.getCollateralValue(borrower, address(sepoliaWETHMockToken));


assertLt(maxBorrowable, vaultCollateralPLSTValue);

}


function testDepositAndGetStabilskiTokens(uint256 amountToBorrow) public {
//Set requirements for assume
vm.assume(amountToBorrow > 1e15 && amountToBorrow < sepoliaWETHMockToken.balanceOf(borrower));

vm.startPrank(borrower);

// Approve the amount of weth and deposit it
sepoliaWETHMockToken.approve(address(vaultManager), amountToBorrow);
vaultManager.depositCollateral(address(sepoliaWETHMockToken));

assertEq(stabilskiToken.balanceOf(borrower), 0);

// Get reverted because of flawed amount or invalid collateral token
assertGt(vaultManager.getCollateralValue(borrower, address(sepoliaWETHMockToken)), 0);
uint256 amountFlawed=vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken)) + 1;
vm.expectRevert();
vaultManager.mintPLST(address(sepoliaWETHMockToken), amountFlawed);

vm.expectRevert();
vaultManager.mintPLST(address(12), 12e18);

// Borrow Amount Above Min Collateral Ratio
uint256 amountToMint = vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken));

vaultManager.mintPLST(address(sepoliaWETHMockToken), amountToMint);

assertEq(stabilskiToken.balanceOf(borrower), amountToMint);

(,uint256 minimalHealthFactor,,,)=collateralManager.getCollateralInfo(address(sepoliaWETHMockToken));

// Check if vault health factor greater than minimal
assertGt(vaultManager.getVaultHealthFactor(borrower, address(sepoliaWETHMockToken)), minimalHealthFactor);

stabilskiToken.approve(address(vaultManager), ((amountToMint * 1e18) / 108e16));
vaultManager.repayPLST(address(sepoliaWETHMockToken));
vm.stopPrank();

vm.startPrank(liquidator);
sepoliaWETHMockToken.approve(address(vaultManager), amountToBorrow);
vaultManager.depositCollateral(address(sepoliaWETHMockToken));
vaultManager.mintPLST(address(sepoliaWETHMockToken), vaultManager.getMaxBorrowableStabilskiTokens(liquidator, address(sepoliaWETHMockToken)));

assertGt(stabilskiToken.balanceOf(liquidator), 0);
 
vm.expectRevert();
vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));

vm.stopPrank();

}

function testRepayAndWithdrawPartOfCollateral() public {
vm.startPrank(borrower);
// Approve the amount to be deposited in vaultManager
sepoliaWETHMockToken.approveInternal(address(vaultManager), borrowTokenAmount);

// Deposit the amount of collateral
vaultManager.depositCollateral(address(sepoliaWETHMockToken));

// Mint stabilski backed by collateral
vaultManager.mintPLST(address(sepoliaWETHMockToken), vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken)));

// token-balance and health-factor after minting
uint256 stabilskiTokenBalanceBefore = stabilskiToken.balanceOf(borrower);
uint256 healthFactorBefore = vaultManager.getVaultHealthFactor(borrower, address(sepoliaWETHMockToken));


// Repay all the debt
stabilskiToken.approve(address(vaultManager), stabilskiTokenBalanceBefore);
vaultManager.repayPLST(address(sepoliaWETHMockToken));

assertGt(stabilskiTokenBalanceBefore, stabilskiToken.balanceOf(borrower));
assertLt(healthFactorBefore, vaultManager.getVaultHealthFactor(borrower, address(sepoliaWETHMockToken)));

(uint256 collateralValue,,,) =  vaultManager.getVaultInfo(borrower, address(sepoliaWETHMockToken));

bool isHealthyAfterWithdrawal = vaultManager.getIsHealthyAfterWithdrawal(collateralValue, address(sepoliaWETHMockToken));

assertEq(isHealthyAfterWithdrawal, true);

vaultManager.withdrawCollateral(address(sepoliaWETHMockToken),collateralValue);
vm.stopPrank();

assertEq(sepoliaWETHMockToken.balanceOf(address(this)), 0);

vm.expectRevert();
vaultManager.depositCollateral(address(sepoliaWETHMockToken));

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

vm.expectRevert();
stabilskiToken.transferOwnership(borrower);

vm.prank(stabilskiToken.owner());
stabilskiToken.transferOwnership(borrower);


vm.expectRevert();
stabilskiToken.setNewCCIPAdmin(borrower);

vm.prank(stabilskiToken.getCCIPAdmin());
vm.expectRevert();
stabilskiToken.setNewCCIPAdmin(borrower);

vm.prank(borrower);
stabilskiToken.setNewCCIPAdmin(borrower);


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


function testLiqudationProcess(uint256 collateralAmount) public {

vm.assume(collateralAmount > 1e16 && collateralAmount < sepoliaWETHMockToken.balanceOf(borrower));

uint256 borrowerWETHBalanceBeforeLiquidation = sepoliaWETHMockToken.balanceOf(borrower);

vm.startPrank(borrower);

sepoliaWETHMockToken.approve(address(vaultManager), sepoliaWETHMockToken.balanceOf(borrower) + 1);
vm.expectRevert();
vaultManager.depositCollateral(address(sepoliaWETHMockToken));


sepoliaWETHMockToken.approve(address(vaultManager), collateralAmount);
vaultManager.depositCollateral(address(sepoliaWETHMockToken));

uint256 mintAmount = vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken));
// Get amount slightly above min (flawed) ratio.
vaultManager.mintPLST(address(sepoliaWETHMockToken), mintAmount - ((mintAmount * 1e18) / 108e16));

(, uint256 debt,,)=vaultManager.getVaultInfo(borrower, address(sepoliaWETHMockToken));

// Check if can liquidate itself
vm.expectRevert();
vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));

vm.stopPrank();


// Turn into liquidator, deposit and get max tokens
vm.startPrank(liquidator);

sepoliaWETHMockToken.approveInternal(address(vaultManager), collateralAmount);
vaultManager.depositCollateral(address(sepoliaWETHMockToken));

// get less plst than the borrower has borrowed
vaultManager.mintPLST(address(sepoliaWETHMockToken), (stabilskiToken.balanceOf(borrower) * 1e18) / 11e17);


// Revert because of not enough PLST
stabilskiToken.approve(address(vaultManager), debt);
vm.expectRevert();
vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));

vaultManager.mintPLST(address(sepoliaWETHMockToken), vaultManager.getMaxBorrowableStabilskiTokens(liquidator, address(sepoliaWETHMockToken)));

// Revert because of position overcollaterized
stabilskiToken.approve(address(vaultManager), debt);
vm.expectRevert();
vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));

vm.stopPrank();

// Mint full amount of borrower allowed
vm.startPrank(borrower);
vaultManager.mintPLST(address(sepoliaWETHMockToken), vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken)));
vm.stopPrank();

uint256 liquidatorWETHBalanceBeforeLiquidation = sepoliaWETHMockToken.balanceOf(liquidator);

// Because of flawed specified function in vautManager, it downgrades the ration (only for testing purposes)
vm.startPrank(liquidator);
(, uint256 newDebt,,)=vaultManager.getVaultInfo(borrower, address(sepoliaWETHMockToken));

stabilskiToken.approve(address(vaultManager), newDebt);
vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));


vm.stopPrank();


assertGt(sepoliaWETHMockToken.balanceOf(liquidator), liquidatorWETHBalanceBeforeLiquidation);
assertLt(sepoliaWETHMockToken.balanceOf(borrower), borrowerWETHBalanceBeforeLiquidation);
}


function testProtocolFlowForWBTC(uint256 amountToBorrow) public {
vm.selectFork(sepoliaEthFork);
// constrain the amount to be grater than zero but not greater than user's balance of wbtc
vm.assume(amountToBorrow > 1e4 && amountToBorrow <= 55e8);

// Turn into borrower
vm.startPrank(borrower);
// approve and deposit BTC
sepoliaWBTCMockToken.approve(address(vaultManager), amountToBorrow);
vaultManager.depositCollateral(address(sepoliaWBTCMockToken));

// Get case if no debt is taken
vaultManager.getIsHealthyAfterWithdrawal(amountToBorrow, address(sepoliaWBTCMockToken));

// Get max amount to mint
uint256 amountToMint = vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWBTCMockToken)) ;

assert(amountToMint > 0);

vaultManager.mintPLST(address(sepoliaWBTCMockToken), amountToMint);

(uint256 collateralAmount,uint256 stabilskiDebt,,)=vaultManager.getVaultInfo(borrower, address(sepoliaWBTCMockToken));

assertEq(stabilskiToken.balanceOf(borrower), amountToMint);

// Check if can withdraw some amount (collateral needs to keep the ratio), will gail 
bool isHealthyAfterWithrawal = vaultManager.getIsHealthyAfterWithdrawal(collateralAmount, address(sepoliaWBTCMockToken));

assertEq(isHealthyAfterWithrawal, false);

// Approve and repay 
stabilskiToken.approve(address(vaultManager), stabilskiDebt + 1);

// fail not enough debt to be paid (too big amount approved)
vm.expectRevert();
vaultManager.repayPLST(address(sepoliaWBTCMockToken));


// Succeed enough amount to repay some amount of debt
stabilskiToken.approve(address(vaultManager), stabilskiDebt / 2);

vaultManager.repayPLST(address(sepoliaWBTCMockToken));

// Revert because of too big amount provided to withdraw
vm.expectRevert();
vaultManager.withdrawCollateral(address(sepoliaWBTCMockToken), collateralAmount + 1);

vaultManager.withdrawCollateral(address(sepoliaWBTCMockToken), collateralAmount / 1e2);

(uint256 collateralAmount2,,,)=vaultManager.getVaultInfo(borrower, address(sepoliaWBTCMockToken));

// Check if amount is possible to be withdrawn
bool isHealthyAfterWithrawalSecond = vaultManager.getIsHealthyAfterWithdrawal((collateralAmount2 * 1e18) / 1e25, address(sepoliaWBTCMockToken));

assertEq(isHealthyAfterWithrawalSecond, true);

assertGt(collateralAmount, collateralAmount2);

vm.stopPrank();

vm.startPrank(liquidator);
sepoliaWBTCMockToken.approve(address(vaultManager), amountToBorrow);
vaultManager.depositCollateral(address(sepoliaWBTCMockToken));
vaultManager.mintPLST(address(sepoliaWBTCMockToken), vaultManager.getMaxBorrowableStabilskiTokens(liquidator, address(sepoliaWBTCMockToken)));


(, uint256 debt,,)=vaultManager.getVaultInfo(borrower, address(sepoliaWBTCMockToken));


stabilskiToken.approve(address(vaultManager), debt);

vm.expectRevert();
vaultManager.liquidateVault(borrower, address(sepoliaWBTCMockToken));

vm.stopPrank();

vm.startPrank(borrower);
vaultManager.mintPLST(address(sepoliaWBTCMockToken), vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWBTCMockToken)));
vm.stopPrank();

vm.startPrank(liquidator);
vm.expectRevert();
vaultManager.liquidateVault(borrower, address(sepoliaWBTCMockToken));

sepoliaWBTCMockToken.approve(address(vaultManager), amountToBorrow);
vaultManager.depositCollateral(address(sepoliaWBTCMockToken));
vaultManager.mintPLST(address(sepoliaWBTCMockToken), vaultManager.getMaxBorrowableStabilskiTokens(liquidator, address(sepoliaWBTCMockToken)));

(, uint256 newDebt,,)=vaultManager.getVaultInfo(borrower, address(sepoliaWBTCMockToken));

stabilskiToken.approve(address(vaultManager), newDebt);

vaultManager.liquidateVault(borrower, address(sepoliaWBTCMockToken));

vm.stopPrank();


}


function testIsAmountApprovedOverDebt() public {

// Test WETH token

vm.selectFork(sepoliaEthFork);

vm.startPrank(borrower);

sepoliaWETHMockToken.approve(address(vaultManager), 10e18);

vaultManager.depositCollateral(address(sepoliaWETHMockToken));

uint256 sepoliaEthCollateralValueWETH = vaultManager.getCollateralValue(borrower, address(sepoliaWLINKMockToken));

uint256 sepoliaEthMaxBorrowableAmountWETH = vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWLINKMockToken));

vm.stopPrank();

vm.selectFork(baseSepoliaFork);

vm.startPrank(borrower);

baseWETHMockToken.approve(address(baseSepoliaVaultManager), 1e18);

baseSepoliaVaultManager.depositCollateral(address(baseWETHMockToken));

uint256 basehCollateralValueWETH = baseSepoliaVaultManager.getCollateralValue(borrower, address(baseWETHMockToken));

uint256 baseMaxBorrowableAmountWETH = baseSepoliaVaultManager.getMaxBorrowableStabilskiTokens(borrower, address(baseWETHMockToken));


vm.stopPrank();

vm.prank(baseSepoliaCollateralManager.getTheCollateralManagerOwner());
baseSepoliaCollateralManager.toggleCollateral(address(baseWETHMockToken));


vm.startPrank(borrower);
vm.expectRevert();
baseSepoliaVaultManager.mintPLST(address(baseWETHMockToken), baseMaxBorrowableAmountWETH);
vm.stopPrank();


vm.prank(baseSepoliaCollateralManager.getTheCollateralManagerOwner());
baseSepoliaCollateralManager.toggleCollateral(address(baseWETHMockToken));

vm.startPrank(borrower);
baseSepoliaVaultManager.mintPLST(address(baseWETHMockToken), baseMaxBorrowableAmountWETH);


baseSepoliaStabilskiToken.approve(address(baseSepoliaVaultManager), baseSepoliaStabilskiToken.balanceOf(borrower));

baseSepoliaVaultManager.repayPLST(address(baseWETHMockToken));

vm.stopPrank();

}



// CCIP Functionalities Check

function testCCIPTransferFromSepoliaETHtoBaseSepolia(uint256 amountToSend) public {

    vm.assume(amountToSend > 1e7 && amountToSend <= 1e24);

    uint256 feeReceiverBalanceBefore = feesReceiver.balance;

vm.selectFork(sepoliaEthFork);
vm.prank(ethSepoliaStabilskiTokenPool.owner());
applyChain(
    address(ethSepoliaStabilskiTokenPool), address(baseSepoliaStabilskiTokenPool),address(arbSepoliaStabilskiTokenPool),
    address(baseSepoliaStabilskiToken), address(arbitrumstabilskiToken), baseChainSelector, arbitrumChainSelector
    );

vm.selectFork(baseSepoliaFork);
vm.prank(baseSepoliaStabilskiTokenPool.owner());
applyChain(
    address(baseSepoliaStabilskiTokenPool), address(ethSepoliaStabilskiTokenPool),address(arbSepoliaStabilskiTokenPool),
    address(stabilskiToken), address(arbitrumstabilskiToken), sepoliaDestinationChainSelector, arbitrumChainSelector
    );

vm.selectFork(arbitrumSepoliaFork);
vm.prank(msg.sender);
applyChain(
    address(arbSepoliaStabilskiTokenPool),
    address(ethSepoliaStabilskiTokenPool),
    address(baseSepoliaStabilskiTokenPool),
    address(stabilskiToken), address(baseSepoliaStabilskiToken), sepoliaDestinationChainSelector, baseChainSelector
    );

vm.selectFork(sepoliaEthFork);
     

        stabilskiToken.mint(address(borrower), amountToSend);
        vm.startPrank(borrower);
        
        uint256 balanceBeforeTx= stabilskiToken.balanceOf(borrower);


        Client.EVM2AnyMessage memory message = ethCcipRetriever.getCcipMessage(borrower, amountToSend);

            (uint256 ccipFees, uint256 protocolFees) = ethCcipRetriever.getCcipTotalFees(borrower, amountToSend, baseSepoliaNetworkDetails.chainSelector);

            uint256 feesToPay = ccipFees + protocolFees;

        stabilskiToken.approve(address(ethCcipRetriever), amountToSend);
            vm.expectRevert();
     bytes32 messageIdFlawed1 = ethCcipRetriever.sendCcipMessage{value:feesToPay-1}(
        borrower, amountToSend, baseSepoliaNetworkDetails.chainSelector
     );

        vm.expectRevert();
     bytes32 messageIdFlawed2 = ethCcipRetriever.sendCcipMessage{value:feesToPay}(
        borrower, 5e18, baseSepoliaNetworkDetails.chainSelector
     );


     bytes32 messageId = ethCcipRetriever.sendCcipMessage{value:feesToPay}(
        borrower, amountToSend, baseSepoliaNetworkDetails.chainSelector
     );

        uint256 balanceAfterTx = stabilskiToken.balanceOf(borrower);

        assertEq(balanceAfterTx,  0);
        vm.stopPrank();

        uint256 feeReceiverBalanceAfter = feesReceiver.balance;
    
    assertGt(feeReceiverBalanceAfter, feeReceiverBalanceBefore);

    ccipLocalSimulatorFork.switchChainAndRouteMessage(baseSepoliaFork);

        uint256 balanceOfAfterBaseSepolia = baseSepoliaStabilskiToken.balanceOf(borrower);
        assertEq(balanceOfAfterBaseSepolia, amountToSend);

}


function testCCIPTransferFromSepoliaETHtoArbSepolia() public {

vm.selectFork(sepoliaEthFork);
vm.prank(ethSepoliaStabilskiTokenPool.owner());
applyChain(
    address(ethSepoliaStabilskiTokenPool), address(baseSepoliaStabilskiTokenPool),address(arbSepoliaStabilskiTokenPool),
    address(baseSepoliaStabilskiToken), address(arbitrumstabilskiToken), baseChainSelector, arbitrumChainSelector
    );

vm.selectFork(baseSepoliaFork);
vm.prank(baseSepoliaStabilskiTokenPool.owner());
applyChain(
    address(baseSepoliaStabilskiTokenPool), address(ethSepoliaStabilskiTokenPool),address(arbSepoliaStabilskiTokenPool),
    address(stabilskiToken), address(arbitrumstabilskiToken), sepoliaDestinationChainSelector, arbitrumChainSelector
    );

vm.selectFork(arbitrumSepoliaFork);
vm.prank(msg.sender);
applyChain(
    address(arbSepoliaStabilskiTokenPool),
    address(ethSepoliaStabilskiTokenPool),
    address(baseSepoliaStabilskiTokenPool),
    address(stabilskiToken), address(baseSepoliaStabilskiToken), sepoliaDestinationChainSelector, baseChainSelector
    );

vm.selectFork(sepoliaEthFork);


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
                extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 500000})),
                feeToken: address(0)
            });

            uint256 feesToPay = routerEthSepolia.getFee(arbitrumChainSelector, message);


     bytes32 messageId = routerEthSepolia.ccipSend{value:feesToPay}(
            arbitrumChainSelector,message
        );


        uint256 balanceAfterTx = stabilskiToken.balanceOf(borrower);

        assertEq(balanceAfterTx,  balanceBeforeTx - 1e18);
        vm.stopPrank();
    
    ccipLocalSimulatorFork.switchChainAndRouteMessage(arbitrumSepoliaFork);

        uint256 balanceOfAfterBaseSepolia = arbitrumstabilskiToken.balanceOf(borrower);
        assertEq(balanceOfAfterBaseSepolia, 1e18);

}


function testCCIPTransferFromSepoliaArbtoEthSepolia() public {

vm.selectFork(arbitrumSepoliaFork);
vm.deal(borrower, 100e18);
vm.prank(arbSepoliaStabilskiTokenPool.owner());
applyChain(
    address(arbSepoliaStabilskiTokenPool),
    address(ethSepoliaStabilskiTokenPool),
    address(baseSepoliaStabilskiTokenPool),
    address(stabilskiToken), address(baseSepoliaStabilskiToken), sepoliaDestinationChainSelector, baseChainSelector
    );


vm.selectFork(baseSepoliaFork);
vm.deal(borrower, 100e18);
vm.prank(baseSepoliaStabilskiTokenPool.owner());
applyChain(
    address(baseSepoliaStabilskiTokenPool), address(ethSepoliaStabilskiTokenPool),address(arbSepoliaStabilskiTokenPool),
    address(stabilskiToken), address(arbitrumstabilskiToken), sepoliaDestinationChainSelector, arbitrumChainSelector
    );



vm.selectFork(sepoliaEthFork);
vm.deal(borrower, 50e18);
vm.prank(ethSepoliaStabilskiTokenPool.owner());
applyChain(
    address(ethSepoliaStabilskiTokenPool), address(baseSepoliaStabilskiTokenPool),address(arbSepoliaStabilskiTokenPool),
    address(baseSepoliaStabilskiToken), address(arbitrumstabilskiToken), baseChainSelector, arbitrumChainSelector
    );

vm.selectFork(arbitrumSepoliaFork);

    address linkSepolia = arbSepoliaNetworkDetails.linkAddress;
        ccipLocalSimulatorFork.requestLinkFromFaucet(address(borrower), 200e18);

        uint256 amountToSend = 5e18;
        Client.EVMTokenAmount[] memory tokenToSendDetails = new Client.EVMTokenAmount[](1);
        Client.EVMTokenAmount memory tokenAmount =
            Client.EVMTokenAmount({token: address(arbitrumstabilskiToken), amount: 1e18});
        tokenToSendDetails[0] = tokenAmount;

        arbitrumstabilskiToken.mint(address(borrower), amountToSend);
        vm.startPrank(borrower);
uint256 balanceBeforeTx= arbitrumstabilskiToken.balanceOf(borrower);
        arbitrumstabilskiToken.approve(arbSepoliaNetworkDetails.routerAddress, 1e18);
        IERC20(linkSepolia).approve(arbSepoliaNetworkDetails.routerAddress, 200e18);


        IRouterClient routerBaseSepolia = IRouterClient(arbSepoliaNetworkDetails.routerAddress);

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
                receiver: abi.encode(address(borrower)),
                data: "",
                tokenAmounts: tokenToSendDetails,
                extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 5000000})),
                feeToken: address(0)
            });

            uint256 feesToPay = routerBaseSepolia.getFee(sepoliaDestinationChainSelector, message);


     bytes32 messageId = routerBaseSepolia.ccipSend{value:feesToPay}(
            sepoliaDestinationChainSelector,message
        );


        uint256 balanceAfterTx = arbitrumstabilskiToken.balanceOf(borrower);

        assertEq(balanceAfterTx,  balanceBeforeTx - 1e18);
        
    
    ccipLocalSimulatorFork.switchChainAndRouteMessage(sepoliaEthFork);
}


function testCCIPTransferFromSepoliaArbtoBaseSepolia() public {

vm.selectFork(arbitrumSepoliaFork);
vm.deal(borrower, 100e18);
vm.prank(arbSepoliaStabilskiTokenPool.owner());
applyChain(
    address(arbSepoliaStabilskiTokenPool),
    address(ethSepoliaStabilskiTokenPool),
    address(baseSepoliaStabilskiTokenPool),
    address(stabilskiToken), address(baseSepoliaStabilskiToken), sepoliaDestinationChainSelector, baseChainSelector
    );


vm.selectFork(baseSepoliaFork);
vm.deal(borrower, 100e18);
vm.prank(baseSepoliaStabilskiTokenPool.owner());
applyChain(
    address(baseSepoliaStabilskiTokenPool), address(ethSepoliaStabilskiTokenPool),address(arbSepoliaStabilskiTokenPool),
    address(stabilskiToken), address(arbitrumstabilskiToken), sepoliaDestinationChainSelector, arbitrumChainSelector
    );



vm.selectFork(sepoliaEthFork);
vm.deal(borrower, 50e18);
vm.prank(ethSepoliaStabilskiTokenPool.owner());
applyChain(
    address(ethSepoliaStabilskiTokenPool), address(baseSepoliaStabilskiTokenPool),address(arbSepoliaStabilskiTokenPool),
    address(baseSepoliaStabilskiToken), address(arbitrumstabilskiToken), baseChainSelector, arbitrumChainSelector
    );

vm.selectFork(arbitrumSepoliaFork);

    address linkSepolia = arbSepoliaNetworkDetails.linkAddress;
        ccipLocalSimulatorFork.requestLinkFromFaucet(address(borrower), 200e18);

        uint256 amountToSend = 5e18;
        Client.EVMTokenAmount[] memory tokenToSendDetails = new Client.EVMTokenAmount[](1);
        Client.EVMTokenAmount memory tokenAmount =
            Client.EVMTokenAmount({token: address(arbitrumstabilskiToken), amount: 1e18});
        tokenToSendDetails[0] = tokenAmount;

        arbitrumstabilskiToken.mint(address(borrower), amountToSend);
        vm.startPrank(borrower);
uint256 balanceBeforeTx= arbitrumstabilskiToken.balanceOf(borrower);
        arbitrumstabilskiToken.approve(arbSepoliaNetworkDetails.routerAddress, 1e18);
        IERC20(linkSepolia).approve(arbSepoliaNetworkDetails.routerAddress, 200e18);


        IRouterClient routerBaseSepolia = IRouterClient(arbSepoliaNetworkDetails.routerAddress);

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
                receiver: abi.encode(address(borrower)),
                data: "",
                tokenAmounts: tokenToSendDetails,
                extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 500000})),
                feeToken: address(0)
            });

            uint256 feesToPay = routerBaseSepolia.getFee(baseSepoliaNetworkDetails.chainSelector, message);


     bytes32 messageId = routerBaseSepolia.ccipSend{value:feesToPay}(
            baseSepoliaNetworkDetails.chainSelector,message
        );


        uint256 balanceAfterTx = arbitrumstabilskiToken.balanceOf(borrower);

        assertEq(balanceAfterTx,  balanceBeforeTx - 1e18);
        
    
    ccipLocalSimulatorFork.switchChainAndRouteMessage(baseSepoliaFork);
}





}