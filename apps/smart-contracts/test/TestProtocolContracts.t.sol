// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {VaultManager} from "../src/VaultManager.sol";
import {CollateralManager} from "../src/CollateralManager.sol";
import {USDPLNOracle} from "../src/USDPLNOracle.sol";
import {StabilskiToken} from "../src/StabilskiToken.sol";
import {StabilskiTokenPool} from "../src/pools/StabilskiTokenPool.sol";
import {Test} from "../lib/forge-std/src/Test.sol";
import {DeployContracts} from "../script/DeployContracts.s.sol";
import {ERC20Mock} from "../src/interfaces/ERC20Mock.sol";
import {CCIPLocalSimulator, BurnMintERC677Helper, IERC20 } from "../lib/chainlink-local/src/ccip/CCIPLocalSimulator.sol";
import {RateLimiter} from "../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/libraries/RateLimiter.sol";
import { TokenPool} from "../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/pools/BurnMintTokenPool.sol";

import {TokenAdminRegistry} from "../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/tokenAdminRegistry/TokenAdminRegistry.sol";
import {CCIPLocalSimulatorFork, Register} from "../lib/chainlink-local/src/ccip/CCIPLocalSimulatorFork.sol";
import {RegistryModuleOwnerCustom} from
    "../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/tokenAdminRegistry/RegistryModuleOwnerCustom.sol";
import { IRouterClient } from "../lib/ccip/contracts/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { Pool }  from "../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/libraries/Pool.sol";

import {DeployReceiverAndSender} from "../script/DeployReceiverAndSender.s.sol";
import{StabilskiTokenReceiver} from "../src/cross-chain-management/StabilskiTokenReceiver.sol";
import{StabilskiTokenSender} from "../src/cross-chain-management/StabilskiTokenSender.sol";
import{CCIPLocalSimulatorFork, Register} from "../lib/chainlink-local/src/ccip/CCIPLocalSimulatorFork.sol";
import { console } from "../lib/forge-std/src/console.sol";
import { Client } from "../lib/ccip/contracts/src/v0.8/ccip/libraries/Client.sol";

contract TestContract is Test {

uint256 sepoliaEthFork;
uint256 arbitrumSepoliaFork;
CCIPLocalSimulator ccipLocalSimulator;


// Ethereum Sepolia contracts
VaultManager vaultManager;
StabilskiToken internal stabilskiToken;
USDPLNOracle usdPlnOracle;
CollateralManager collateralManager;
StabilskiTokenPool stabilskiTokenPool;
ERC20Mock sepoliaWETHMockToken;
ERC20Mock sepoliaWBTCMockToken;
ERC20Mock sepoliaWLINKMockToken;

// Arbitrum Sepolia contracts
VaultManager ArbitrumvaultManager;
StabilskiToken ArbitrumstabilskiToken;
USDPLNOracle ArbitrumusdPlnOracle;
CollateralManager ArbitrumcollateralManager;
StabilskiTokenPool ArbitrumstabilskiTokenPool;
ERC20Mock arbitrumLINKMockToken;

// Cross-chain management contracts (Ethereum Sepolia)
IRouterClient router;
uint64 sepoliaDestinationChainSelector;

// Cross-chain management contracts (Arbitrum Sepolia)
IRouterClient arbitrumRouter;
uint64 arbitrumChainSelector;


CCIPLocalSimulatorFork ccipLocalSimulatorFork;

DeployReceiverAndSender deployReceiverAndSenderSepoliaEth;
DeployReceiverAndSender deployReceiverAndSenderSepoliaArbitrum;

StabilskiTokenReceiver stabilskiTokenReceiverSepoliaEth;
StabilskiTokenSender stabilskiTokenSenderSepoliaEth;

StabilskiTokenReceiver stabilskiTokenReceiverSepoliaArbitrum;
StabilskiTokenSender stabilskiTokenSenderSepoliaArbitrum;

address borrower=makeAddr("borrower");
address liquidator=makeAddr("liquidator");

address wethInvalidAddress;

Register.NetworkDetails ethSepoliaNetworkDetails;
Register.NetworkDetails arbSepoliaNetworkDetails;

uint256 constant borrowTokenAmount = 1e19;
uint256 constant borrowWBTCAmount = 10e8;


function setUp() public {
// Estabilish 2 forks and select eth sepolia as the intial one.
sepoliaEthFork=vm.createSelectFork("ETH_SEPOLIA_RPC_URL");
arbitrumSepoliaFork=vm.createFork("ARB_SEPOLIA_RPC_URL");

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
(vaultManager, stabilskiToken, usdPlnOracle, collateralManager, stabilskiTokenPool) = deployContracts.run(tokens, whitelist, priceFeeds, minCollateralRatios, sourceNetworkDetails.rmnProxyAddress, sourceNetworkDetails.routerAddress);

vm.makePersistent(address(usdPlnOracle));

vm.deal(borrower, 1000 ether);

// Switch to arbitrum fork
vm.selectFork(arbitrumSepoliaFork);

// Get the network details for the arbitrum fork
Register.NetworkDetails
            memory 
            abitrumNetDetails
             = ccipLocalSimulatorFork
                .getNetworkDetails(block.chainid);
        arbitrumRouter = IRouterClient(abitrumNetDetails.routerAddress);
        arbitrumChainSelector= abitrumNetDetails.chainSelector;
        arbSepoliaNetworkDetails = abitrumNetDetails;

// Create the tokens
arbitrumLINKMockToken=new ERC20Mock("LINK", "LINK", borrower,liquidator, 1000 ether, 18);
tokens = new address[](1);
priceFeeds = new address[](1) ;
minCollateralRatios = new uint256[](1) ;

// deploy the contracts on the arbitrum fork
tokens[0]=address(arbitrumLINKMockToken);
priceFeeds[0]=vm.envAddress("ARBITRUM_LINK_USD_RATE");
minCollateralRatios[0]=12e17;


DeployContracts deployContractsArbitrum = new DeployContracts();
(ArbitrumvaultManager, ArbitrumstabilskiToken, ArbitrumusdPlnOracle, ArbitrumcollateralManager, ArbitrumstabilskiTokenPool) = deployContractsArbitrum.run(tokens, whitelist, priceFeeds, minCollateralRatios, abitrumNetDetails.rmnProxyAddress, abitrumNetDetails.routerAddress);

DeployReceiverAndSender deployReceiverAndSenderArbitrum = new DeployReceiverAndSender();

(stabilskiTokenReceiverSepoliaArbitrum, stabilskiTokenSenderSepoliaArbitrum) = deployReceiverAndSenderArbitrum.run(
address(arbitrumRouter),
address(ArbitrumstabilskiTokenPool),
address(stabilskiTokenPool),
address(stabilskiToken)
);

vm.selectFork(sepoliaEthFork);


DeployReceiverAndSender deployReceiverAndSender = new DeployReceiverAndSender();

(stabilskiTokenReceiverSepoliaEth, stabilskiTokenSenderSepoliaEth) = deployReceiverAndSender.run(
address(router),
address(stabilskiTokenPool),
address(ArbitrumstabilskiTokenPool),
address(ArbitrumstabilskiToken)
);

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


function testCheckReveicerFunctionsGetRetrieved() public view {
 bool interfaceSupport =   stabilskiTokenReceiverSepoliaEth.supportsInterface(bytes4(abi.encode(address(ArbitrumstabilskiToken))));
address stabilskiRouter = stabilskiTokenReceiverSepoliaEth.getRouter();

assertEq(stabilskiRouter, address(router));
assertEq(interfaceSupport, false);
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

    stabilskiToken.mint(address(borrower), borrowTokenAmount);

    vm.expectRevert();
    stabilskiToken.burn(address(borrower), borrowTokenAmount);

    vm.expectRevert();
    stabilskiToken.burnFrom(address(borrower), borrowTokenAmount);
  

    vm.startPrank(address(vaultManager));
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


vm.prank(address(vaultManager));
stabilskiToken.revokeControllerRole(address(borrower));

vm.expectRevert();
stabilskiToken.grantControllerRole(address(borrower));

vm.expectRevert();
stabilskiToken.revokeControllerRole(address(borrower));


stabilskiToken.decimals();
stabilskiToken.getCCIPAdmin();
stabilskiToken.symbol();
stabilskiToken.totalSupply();
stabilskiToken.name();


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


// function testFunctioningOfTokenPools() public {
// // Grant the role of burner and minter on sepolia ethereum testnet
// vm.startPrank(address(vaultManager));
// stabilskiToken.grantControllerRole(borrower);
// stabilskiToken.grantControllerRole(address(stabilskiTokenPool));
// stabilskiToken.grantControllerRole(address(ArbitrumstabilskiTokenPool));
// stabilskiToken.grantControllerRole(address(ArbitrumvaultManager));
// stabilskiToken.setNewCCIPAdmin(borrower);
// stabilskiToken.transferOwnership(borrower);
// vm.stopPrank();

// // Admin role is granted to the borrower on the sepolia fork for CCIP
// RegistryModuleOwnerCustom registryModuleOwnerCustomEthSepolia =
//             RegistryModuleOwnerCustom(ethSepoliaNetworkDetails.registryModuleOwnerCustomAddress);

// vm.prank(borrower);
//         registryModuleOwnerCustomEthSepolia.registerAdminViaGetCCIPAdmin(address(stabilskiToken));

// // Switch to arbitrum fork
// vm.selectFork(arbitrumSepoliaFork);
// // Grant the borrower the role of burner and minter on arbitrum sepolia testnet and ownership.
// vm.startPrank(address(ArbitrumvaultManager));
// ArbitrumstabilskiToken.grantControllerRole(borrower);
// ArbitrumstabilskiToken.setNewCCIPAdmin(borrower);
// ArbitrumstabilskiToken.transferOwnership(borrower);
// vm.stopPrank();

// // Register the borrower as the admin on the arbitrum sepolia fork for CCIP
// RegistryModuleOwnerCustom registryModuleOwnerCustomArbSepolia =
//             RegistryModuleOwnerCustom(arbSepoliaNetworkDetails.registryModuleOwnerCustomAddress);


// vm.prank(borrower);
//         registryModuleOwnerCustomArbSepolia.registerAdminViaGetCCIPAdmin(address(ArbitrumstabilskiToken));

// // Switch back to sepolia eth fork and set the pools for the tokens.
// vm.selectFork(sepoliaEthFork);
// // set the token admin registry for the sepolia eth fork
//     TokenAdminRegistry tokenAdminRegistryEthSepolia =
//             TokenAdminRegistry(ethSepoliaNetworkDetails.tokenAdminRegistryAddress);
//   vm.startPrank(borrower);
//         tokenAdminRegistryEthSepolia.acceptAdminRole(address(stabilskiToken));
//         vm.stopPrank();

// // Switch to arbitrum fork
// vm.selectFork(arbitrumSepoliaFork);

// // set the token admin registry for the arbitrum sepolia fork

//     TokenAdminRegistry tokenAdminRegistryArbSepolia =
//             TokenAdminRegistry(arbSepoliaNetworkDetails.tokenAdminRegistryAddress);

//   vm.startPrank(borrower);
//         tokenAdminRegistryArbSepolia.acceptAdminRole(address(ArbitrumstabilskiToken));
//         vm.stopPrank();

// // Switch to sepolia and arbitrum and set the pools for the tokens.
//         vm.selectFork(sepoliaEthFork);
//         vm.prank(borrower);
//         tokenAdminRegistryEthSepolia.setPool(address(stabilskiToken), address(stabilskiTokenPool));

//         vm.selectFork(arbitrumSepoliaFork);
//         vm.prank(borrower);
//         tokenAdminRegistryArbSepolia.setPool(address(ArbitrumstabilskiToken), address(ArbitrumstabilskiTokenPool));

//         vm.selectFork(sepoliaEthFork);
        
//         vm.startPrank(stabilskiTokenPool.owner());
//         TokenPool.ChainUpdate[] memory chains = new TokenPool.ChainUpdate[](1);
//         bytes[] memory remotePoolAddressesEthSepolia = new bytes[](1);
//         remotePoolAddressesEthSepolia[0] = abi.encode(address(stabilskiTokenPool));
//         chains[0] = TokenPool.ChainUpdate({
//             remoteChainSelector: arbitrumChainSelector,
//             allowed:true,
//             remotePoolAddress: remotePoolAddressesEthSepolia[0],
//             remoteTokenAddress: abi.encode(address(ArbitrumstabilskiToken)),
//             outboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 10e18, rate: 167}),
//             inboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 10e18, rate: 167})
//         });

//         stabilskiTokenPool.applyChainUpdates(chains);
//         vm.stopPrank();


// vm.selectFork(arbitrumSepoliaFork);
        
//         vm.startPrank(ArbitrumstabilskiTokenPool.owner());
//         TokenPool.ChainUpdate[] memory arbitrumSepoliaPoolChains = new TokenPool.ChainUpdate[](1);
//          bytes[] memory remotePoolAddressesArbSepolia = new bytes[](1);
//         remotePoolAddressesArbSepolia[0] = abi.encode(address(ArbitrumstabilskiTokenPool));
   
//         arbitrumSepoliaPoolChains[0] = TokenPool.ChainUpdate({
//             remoteChainSelector: ethSepoliaNetworkDetails.chainSelector,
//             allowed:true,
//             remotePoolAddress: remotePoolAddressesArbSepolia[0],
//             remoteTokenAddress: abi.encode(address(stabilskiToken)),
//             outboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 10e18, rate: 167}),
//             inboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 10e18, rate: 167})
//         });

//         ArbitrumstabilskiTokenPool.applyChainUpdates(arbitrumSepoliaPoolChains);


//         vm.stopPrank();

// vm.selectFork(sepoliaEthFork);

//     address linkSepolia = ethSepoliaNetworkDetails.linkAddress;
//     ccipLocalSimulatorFork.requestLinkFromFaucet(address(borrower), 
//     20e18);

//     uint256 amountToSend = 1e18;
   
    

//     vm.startPrank(borrower);
//     stabilskiToken.mint(borrower, amountToSend * 5);
//       IERC20(linkSepolia).approve(
//         address(ethSepoliaNetworkDetails.routerAddress), 
//         20e18);
     
  
//     uint256 balanceOfAliceBeforeEthSepolia = stabilskiToken.balanceOf(borrower);
    
//     stabilskiToken.approve(address(stabilskiTokenSenderSepoliaEth), amountToSend);

         


//     vm.stopPrank();

// vm.prank(address(stabilskiTokenSenderSepoliaEth));
// stabilskiToken.transferFrom(borrower, address(stabilskiTokenSenderSepoliaEth), amountToSend);

// vm.startPrank(address(stabilskiTokenSenderSepoliaEth));
// stabilskiToken.approve(address(ethSepoliaNetworkDetails.routerAddress), amountToSend);
// stabilskiToken.approve(address(stabilskiTokenPool), amountToSend);
// vm.stopPrank();


// vm.startPrank(borrower);
   
//    Client.EVMTokenAmount[] memory tokenToSendDetails = new Client.EVMTokenAmount[](1);
//         Client.EVMTokenAmount memory tokenAmount =
//             Client.EVMTokenAmount({token: address(stabilskiToken), amount: amountToSend});
//         tokenToSendDetails[0] = tokenAmount;
        
//         Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
//             receiver: abi.encode(liquidator),
//             data: "",
//             tokenAmounts: tokenToSendDetails,
//             extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 0})),
//             feeToken: linkSepolia
//         });


//         // Send via CCIP
//       (bytes32 ccipSentMessageReturn) = router.ccipSend(arbitrumChainSelector, message);

// vm.stopPrank();

//     uint256 balanceOfAliceAfterEthSepolia = stabilskiToken.balanceOf(borrower);
//     assertEq(balanceOfAliceAfterEthSepolia, balanceOfAliceBeforeEthSepolia - amountToSend);

//     ccipLocalSimulatorFork.switchChainAndRouteMessage(arbitrumSepoliaFork);

//     uint256 balanceOfAliceAfterBaseSepolia = ArbitrumstabilskiToken.balanceOf(borrower);
//     assertEq(balanceOfAliceAfterBaseSepolia, amountToSend);


// }


}