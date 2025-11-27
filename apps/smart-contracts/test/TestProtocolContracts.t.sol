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

import {RateLimiter} from "../lib/ccip/contracts/src/v0.8/ccip/libraries/RateLimiter.sol";
import {BurnMintTokenPool} from "../lib/ccip/contracts/src/v0.8/ccip/pools/BurnMintTokenPool.sol";
import {DeployStabilskiTokenPool} from '../script/ccip-contracts/DeployStabilskiPoolTest.s.sol';

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
minCollateralRatios[0]=135e16;


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



}

function testGetCollateralInfo(address collateralToken, address priceFeedAddress) public {

vm.assume(collateralToken != address(0));
vm.assume(priceFeedAddress != address(0));

vm.startPrank(collateralManager.getTheCollateralManagerOwner());
vm.expectRevert();
(address priceInvaliedFeed,,,,) =  collateralManager.getCollateralInfo(address(0));

// Valid token

(address priceFeed,,,,) =  collateralManager.getCollateralInfo(address(sepoliaWBTCMockToken));

assertEq(priceFeed, vm.envAddress("ETH_BTC_USD"));

collateralManager.toggleCollateral(address(sepoliaWBTCMockToken));

(,,bool isActive,,) =  collateralManager.getCollateralInfo(address(sepoliaWBTCMockToken));


vm.expectRevert();
collateralManager.toggleCollateral(address(0));

vm.expectRevert();
collateralManager.getCollateralInfo(collateralToken);

vm.expectRevert();
collateralManager.addCollateralType(address(collateralToken), address(priceFeedAddress), 1e12, 12, 5);

vm.expectRevert();
collateralManager.updateCollateral(address(collateralToken), address(priceFeedAddress), 13e17);

collateralManager.addCollateralType(address(collateralToken), address(priceFeedAddress), 13e17, 12, 5);

vm.expectRevert();
collateralManager.updateCollateral(address(collateralToken), address(priceFeedAddress), 10e17);

vm.stopPrank();

vm.expectRevert();
collateralManager.addCollateralType(address(collateralToken), address(priceFeedAddress), 13e17, 12, 5);

vm.expectRevert();
collateralManager.updateCollateral(address(collateralToken), address(priceFeedAddress), 10e17);

vm.expectRevert();
collateralManager.getTokenPrice(address(0));

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

usdplnOracle.getTheSource();
usdplnOracle.checkUpkeep(abi.encode("0x"));
usdplnOracle.performUpkeep(abi.encode("0x"));

vm.warp(block.timestamp + usdplnOracle.interval());
assertGt(usdplnOracle.getPLNPrice(), 0);

}

function testDepositInvalidToken() public  {
vm.startPrank(borrower);
sepoliaWETHMockToken.approveInternal(address(vaultManager), borrowTokenAmount);
vm.expectRevert();
vaultManager.depositCollateral(address(
    wethInvalidAddress
));

vm.stopPrank();
}

function testDepositCollateral(uint256 amount) public  {

vm.assume(amount < sepoliaWETHMockToken.balanceOf(borrower) && amount > 0);
vm.startPrank(borrower);
uint256 userBalance=sepoliaWETHMockToken.balanceOf(borrower);
sepoliaWETHMockToken.approveInternal(address(vaultManager), amount);
vaultManager.depositCollateral(address(sepoliaWETHMockToken));

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

// Test 

}


function testDepositAndGetStabilskiTokens() public {
vm.startPrank(borrower);
sepoliaWETHMockToken.approveInternal(address(vaultManager), borrowTokenAmount);
vaultManager.depositCollateral(address(sepoliaWETHMockToken));

assertEq(stabilskiToken.balanceOf(borrower), 0);

assertGt(vaultManager.getCollateralValue(borrower, address(sepoliaWETHMockToken)), 0);
uint256 amountFlawed=vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken)) + 1;
vm.expectRevert();
vaultManager.mintPLST(address(sepoliaWETHMockToken), amountFlawed);

vm.expectRevert();
vaultManager.mintPLST(address(12), 12e18);

// Borrow 1000 PLST
uint256 amountToMint = 1000e18;

vaultManager.mintPLST(address(sepoliaWETHMockToken), amountToMint);

assertEq(stabilskiToken.balanceOf(borrower), amountToMint);

(,uint256 minimalHealthFactor,,,)=collateralManager.getCollateralInfo(address(sepoliaWETHMockToken));

assertGt(vaultManager.getVaultHealthFactor(borrower, address(sepoliaWETHMockToken)), minimalHealthFactor);

uint256 amountToRepay=stabilskiToken.balanceOf(borrower) / 2;

stabilskiToken.approve(address(vaultManager), amountToRepay);
vaultManager.repayPLST(address(sepoliaWETHMockToken));
vm.stopPrank();

vm.startPrank(liquidator);
sepoliaWETHMockToken.approveInternal(address(vaultManager), 10e18);
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

function testRevertLiquidation() public {
    vm.startPrank(borrower);
sepoliaWETHMockToken.approveInternal(address(vaultManager), borrowTokenAmount);
vaultManager.depositCollateral(address(sepoliaWETHMockToken));
vaultManager.mintPLST(address(sepoliaWETHMockToken), vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken)));
vm.stopPrank();

vm.startPrank(liquidator);
vm.expectRevert();
vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));
vm.stopPrank();
}

function testAddAndUpdateNewToken() public {
vm.startPrank(collateralManager.getTheCollateralManagerOwner()); 
vm.expectRevert();
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

vm.stopPrank();

vm.expectRevert();
collateralManager.getCollateralInfo(address(0));

collateralManager.getCollateralInfo(address(sepoliaWBTCMockToken));

collateralManager.getTheCollateralManagerOwner();

collateralManager.getCollateralTokens();

// Test if any user can toggle the collateral

vm.expectRevert();
collateralManager.toggleCollateral(address(sepoliaWBTCMockToken));

vm.expectRevert();
collateralManager.toggleCollateral(address(11));
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


function testLiqudationProcess() public {
vm.startPrank(borrower);
sepoliaWETHMockToken.approveInternal(address(vaultManager), borrowTokenAmount);
vaultManager.depositCollateral(address(sepoliaWETHMockToken));

uint256 mintAmount = vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken));
vaultManager.mintPLST(address(sepoliaWETHMockToken), mintAmount / 1000);

(, uint256 debt,,)=vaultManager.getVaultInfo(borrower, address(sepoliaWETHMockToken));


vm.expectRevert();
vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));

vm.stopPrank();



vm.startPrank(liquidator);
uint256 borrowerWethBalanceBeforeLiquidation = sepoliaWETHMockToken.balanceOf(borrower);
sepoliaWETHMockToken.approveInternal(address(vaultManager), 1e18);
vaultManager.depositCollateral(address(sepoliaWETHMockToken));
uint256 amountToMint = vaultManager.getMaxBorrowableStabilskiTokens(liquidator, address(sepoliaWETHMockToken));
vaultManager.mintPLST(address(sepoliaWETHMockToken), amountToMint);
uint256 liquidatorWethBalanceBeforeLiquidation = sepoliaWETHMockToken.balanceOf(liquidator);


stabilskiToken.approve(address(vaultManager), debt);
vm.expectRevert();
vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));

vm.stopPrank();


vm.startPrank(borrower);
vaultManager.mintPLST(address(sepoliaWETHMockToken), vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken)));
vm.stopPrank();

vm.startPrank(liquidator);
stabilskiToken.approve(address(vaultManager), debt);
vm.expectRevert();
vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));

sepoliaWETHMockToken.approveInternal(address(vaultManager), borrowTokenAmount);
vaultManager.depositCollateral(address(sepoliaWETHMockToken));

uint256 mintAmountLiquidator = vaultManager.getMaxBorrowableStabilskiTokens(liquidator, address(sepoliaWETHMockToken));
vaultManager.mintPLST(address(sepoliaWETHMockToken), mintAmountLiquidator / 1000);


stabilskiToken.approve(address(vaultManager), 0);

vm.expectRevert();
vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));


stabilskiToken.approve(address(vaultManager), mintAmount);

vm.expectRevert();
vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));

vaultManager.mintPLST(address(sepoliaWETHMockToken), mintAmountLiquidator - (mintAmountLiquidator / 1000));

stabilskiToken.approve(address(vaultManager), mintAmount);
vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));


vm.stopPrank();

// assertGt(sepoliaWETHMockToken.balanceOf(liquidator), liquidatorWethBalanceBeforeLiquidation);
// assertLt(sepoliaWETHMockToken.balanceOf(borrower), borrowerWethBalanceBeforeLiquidation);
}


function testProtocolFlowForWBTC() public {
vm.selectFork(sepoliaEthFork);

vm.startPrank(borrower);
sepoliaWBTCMockToken.approveInternal(address(vaultManager), 1e7);
vaultManager.depositCollateral(address(sepoliaWBTCMockToken));

uint256 amountToMint = vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWBTCMockToken));

assert(amountToMint > 0);

vaultManager.mintPLST(address(sepoliaWBTCMockToken), amountToMint);

assertEq(stabilskiToken.balanceOf(borrower), amountToMint);

bool isHealthyAfterWithrawal = vaultManager.getIsHealthyAfterWithdrawal(uint256(1e7), address(sepoliaWBTCMockToken));

assertEq(isHealthyAfterWithrawal, false);

stabilskiToken.approve(address(vaultManager), amountToMint);

vaultManager.repayPLST(address(sepoliaWBTCMockToken));

bool isHealthyAfterWithrawalSecond = vaultManager.getIsHealthyAfterWithdrawal(uint256(1e7), address(sepoliaWBTCMockToken));

assertEq(isHealthyAfterWithrawalSecond, true);

vm.stopPrank();

}


function testIfMaxBorrowableLesserThanCollateralCrossChain() public {

// Test Link Tokens AcrossChain

vm.startPrank(borrower);

sepoliaWLINKMockToken.approve(address(vaultManager), sepoliaWLINKMockToken.balanceOf(borrower) + 1e18);

vm.expectRevert();
vaultManager.depositCollateral(address(sepoliaWLINKMockToken));


sepoliaWLINKMockToken.approve(address(vaultManager), 10e18);

vaultManager.depositCollateral(address(sepoliaWLINKMockToken));

uint256 sepoliaEthCollateralValue = vaultManager.getCollateralValue(borrower, address(sepoliaWLINKMockToken));

uint256 sepoliaEthMaxBorrowableAmount = vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWLINKMockToken));

vm.stopPrank();

vm.selectFork(arbitrumSepoliaFork);

vm.startPrank(borrower);

arbitrumLINKMockToken.approve(address(ArbitrumvaultManager), 10000e18);

vm.expectRevert();
ArbitrumvaultManager.depositCollateral(address(arbitrumLINKMockToken));

arbitrumLINKMockToken.approve(address(ArbitrumvaultManager), 10e18);

ArbitrumvaultManager.depositCollateral(address(arbitrumLINKMockToken));

uint256 arbitrumCollateralValue = ArbitrumvaultManager.getCollateralValue(borrower, address(arbitrumLINKMockToken));

uint256 arbitrumMaxBorrowableAmount = ArbitrumvaultManager.getMaxBorrowableStabilskiTokens(borrower, address(arbitrumLINKMockToken));

vm.stopPrank();

vm.selectFork(baseSepoliaFork);

vm.startPrank(liquidator);

baseLINKMockToken.approve(address(baseSepoliaVaultManager), 10e18);

baseSepoliaVaultManager.depositCollateral(address(baseLINKMockToken));

uint256 baseCollateralValue = baseSepoliaVaultManager.getCollateralValue(liquidator, address(baseLINKMockToken));

(uint256 baseCollateralAmount,,address baseCollateralTokenAddress,)=baseSepoliaVaultManager.getVaultInfo(liquidator, address(baseLINKMockToken));

uint256 baseMaxBorrowableAmount = baseSepoliaVaultManager.getMaxBorrowableStabilskiTokens(liquidator, address(baseLINKMockToken));

baseSepoliaVaultManager.mintPLST(address(baseLINKMockToken), baseMaxBorrowableAmount);

uint256 balanceBeforeTransferToOtherMember= baseSepoliaStabilskiToken.balanceOf(liquidator);

baseSepoliaStabilskiToken.transfer(borrower, baseMaxBorrowableAmount / 10);

baseSepoliaStabilskiToken.approve(address(baseSepoliaVaultManager), balanceBeforeTransferToOtherMember);
vm.expectRevert();
baseSepoliaVaultManager.repayPLST(baseCollateralTokenAddress);

baseSepoliaStabilskiToken.approve(address(baseSepoliaVaultManager), baseSepoliaStabilskiToken.balanceOf(liquidator));
baseSepoliaVaultManager.repayPLST(baseCollateralTokenAddress);

vm.expectRevert();
baseSepoliaVaultManager.withdrawCollateral(baseCollateralTokenAddress, baseCollateralAmount);


vm.stopPrank();


assertGt(baseCollateralValue, baseMaxBorrowableAmount);
assertGt(arbitrumCollateralValue, arbitrumMaxBorrowableAmount);
assertGt(sepoliaEthCollateralValue, sepoliaEthMaxBorrowableAmount);

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

function testCCIPTransferFromSepoliaETHtoBaseSepolia() public {

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
                extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 0})),
                feeToken: address(0)
            });

            uint256 feesToPay = routerEthSepolia.getFee(baseChainSelector, message);


     bytes32 messageId = routerEthSepolia.ccipSend{value:feesToPay}(
            baseChainSelector,message
        );


        uint256 balanceAfterTx = stabilskiToken.balanceOf(borrower);

        assertEq(balanceAfterTx,  balanceBeforeTx - 1e18);
        vm.stopPrank();
    
    ccipLocalSimulatorFork.switchChainAndRouteMessage(baseSepoliaFork);

        uint256 balanceOfAfterBaseSepolia = baseSepoliaStabilskiToken.balanceOf(borrower);
        assertEq(balanceOfAfterBaseSepolia, 1e18);

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