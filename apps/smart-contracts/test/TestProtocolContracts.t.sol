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
import {CCIPLocalSimulator, BurnMintERC677Helper,IERC20
} from "../lib/chainlink-local/src/ccip/CCIPLocalSimulator.sol";
import {RateLimiter} from "../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/libraries/RateLimiter.sol";
import { TokenPool} from "../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/pools/BurnMintTokenPool.sol";

import {TokenAdminRegistry} from "../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/tokenAdminRegistry/TokenAdminRegistry.sol";
import {CCIPLocalSimulatorFork, Register} from "@chainlink/local/src/ccip/CCIPLocalSimulatorFork.sol";
import {RegistryModuleOwnerCustom} from
    "../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/tokenAdminRegistry/RegistryModuleOwnerCustom.sol";
import {
    IRouterClient
} from "@chainlink/local/src/ccip/CCIPLocalSimulator.sol";
import {Pool}  from "../../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/libraries/Pool.sol";

import {DeployReceiverAndSender} from "../script/DeployReceiverAndSender.s.sol";
import {StabilskiTokenReceiver} from "../src/cross-chain-management/StabilskiTokenReceiver.sol";
import {StabilskiTokenSender} from "../src/cross-chain-management/StabilskiTokenSender.sol";
import {CCIPLocalSimulatorFork, Register} from "@chainlink/local/src/ccip/CCIPLocalSimulatorFork.sol";
import {console} from "../../lib/forge-std/src/console.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";


contract TestContract is Test {

uint256 sepoliaEthFork;
uint256 arbitrumSepoliaFork;
CCIPLocalSimulator ccipLocalSimulator;


// Ethereum Sepolia contracts
VaultManager vaultManager;
StabilskiToken stabilskiToken;
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



// function testCheckBalanceOfBorrower() public  {
// vm.prank(borrower);

// assertGt(sepoliaWETHMockToken.balanceOf(borrower), 0);
// assertGt(sepoliaWBTCMockToken.balanceOf(borrower), 0);
// assertGt(sepoliaWLINKMockToken.balanceOf(borrower), 0);
// }

// function testGetCollateralInfo() public {
// vm.expectRevert();
// (address priceInvaliedFeed,,,,) =  collateralManager.getCollateralInfo(address(0));

// // Valid token

// (address priceFeed,
// ,
// ,
// ,) =  collateralManager.getCollateralInfo(address(sepoliaWBTCMockToken));

// assertEq(priceFeed, vm.envAddress("ETH_BTC_USD"));

// collateralManager.toggleCollateral(address(sepoliaWBTCMockToken));

// vm.expectRevert();
// collateralManager.toggleCollateral(address(0));

// vm.expectRevert();
// collateralManager.getCollateralInfo(address(stabilskiToken));
// }


// function testIsCollateralListEmpty() public view {
// assertGt(collateralManager.getCollateralTokens().length, 0);
// }

// function testGetPriceCollateral() public  {
// address[] memory tokens = collateralManager.getCollateralTokens();
// uint256 price = collateralManager.getTokenPrice(tokens[2]);

// vm.expectRevert();
// collateralManager.getTokenPrice(address(0));

// assertGt(price, 0);
// }

// function testOracleCallsTheAPI() public  {

// USDPLNOracle usdplnOracle = new USDPLNOracle(vm.envAddress("ARBITRUM_FUNCTIONS_ROUTER"), vm.envBytes32("ARBITRUM_DON_ID"), 407);

// usdplnOracle.subscriptionId;
// usdplnOracle.s_lastError;
// usdplnOracle.s_lastFinalizationTimestamp;
// usdplnOracle.s_subscriptionIds;

// vm.expectRevert();
// usdPlnOracle.fullfillExternalFlawed(
//     bytes32(abi.encode("0x")),
//     abi.encode(36555),
//     bytes("0x")
// );

// usdplnOracle.getTheSource();
// usdplnOracle.checkUpkeep(abi.encode("0x"));
// usdplnOracle.performUpkeep(abi.encode("0x"));
// usdplnOracle.fullfillExternalRequest(
//     bytes32(abi.encode("0x")),
//     abi.encode(36555),
//     bytes("0x")
// );
// usdplnOracle.getPLNPrice();



// vm.warp(block.timestamp + usdplnOracle.interval());
// assertGt(usdplnOracle.getPLNPrice(), 0);

// }

// function testDepositInvalidToken() public  {
// vm.startPrank(borrower);
// sepoliaWETHMockToken.approveInternal(address(vaultManager), 1000 ether);
// vm.expectRevert();
// vaultManager.depositCollateral(address(
//     wethInvalidAddress
// ), 1000 ether);

// vm.stopPrank();
// }

// function testDepositCollateral() public  {
// vm.startPrank(borrower);
// sepoliaWETHMockToken.approveInternal(address(vaultManager), 100 ether);
// vaultManager.depositCollateral(address(sepoliaWETHMockToken), 100 ether);
// assertEq(sepoliaWETHMockToken.balanceOf(borrower), 900 ether);
// vm.stopPrank();

// (uint256 collateralAmount, uint256 debt, address collateralToken, uint256 healthFactor)
// =vaultManager.getVaultInfo(borrower, address(sepoliaWETHMockToken));

// assertGt(collateralAmount, 0);
// assertEq(debt, 0);
// assertEq(collateralToken, address(sepoliaWETHMockToken));
// assertGt(healthFactor, 0);

// uint256 maxBorrowable =vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken));

// assertGt(maxBorrowable, 0);
// }

// function testDepositAndGetStabilskiTokens() public {

// stabilskiTokenReceiverSepoliaEth.supportsInterface(bytes4(abi.encode(address(stabilskiToken))));
// stabilskiTokenReceiverSepoliaEth.getRouter();
// vm.startPrank(borrower);
// sepoliaWETHMockToken.approveInternal(address(vaultManager), 10e18);
// vaultManager.depositCollateral(address(sepoliaWETHMockToken), 10e18);

// assertGt(vaultManager.getCollateralValue(borrower, address(sepoliaWETHMockToken)), 0);
// uint256 amountFlawed=vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken)) + 1;
// vm.expectRevert();
// vaultManager.mintPLST(address(sepoliaWETHMockToken), amountFlawed);

// uint256 amountToMint = vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken));

// vaultManager.mintPLST(address(sepoliaWETHMockToken), amountToMint);

// assertGt(stabilskiToken.balanceOf(borrower), 1e18);

// uint256 amountToRepay=stabilskiToken.balanceOf(borrower) / 2;

// stabilskiToken.approve(address(vaultManager), amountToRepay);
// vaultManager.repayPLST(address(sepoliaWETHMockToken), amountToRepay);

// vm.stopPrank();
// }

// function testRepayPartOfCollateral() public {
// vm.startPrank(borrower);
// sepoliaWETHMockToken.approveInternal(address(vaultManager), 1 ether);
// vaultManager.depositCollateral(address(sepoliaWETHMockToken), 1 ether);
// vaultManager.mintPLST(address(sepoliaWETHMockToken), vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken)));
// uint256 stabilskiTokenBalanceBefore = stabilskiToken.balanceOf(borrower);
// uint256 healthFactorBefore = vaultManager.getVaultHealthFactor(borrower, address(sepoliaWETHMockToken));

// stabilskiToken.approve(address(vaultManager), 5000 ether);
// vaultManager.repayPLST(address(sepoliaWETHMockToken), 5000 ether);

// assertGt(stabilskiTokenBalanceBefore, stabilskiToken.balanceOf(borrower));
// assertLt(healthFactorBefore, vaultManager.getVaultHealthFactor(borrower, address(sepoliaWETHMockToken)));

// uint256 amountToWithdraw = (vaultManager.getCollateralValue(borrower, address(sepoliaWETHMockToken)) / usdPlnOracle.getPLNPrice()) * 1e4;

// vm.expectRevert();
// vaultManager.withdrawCollateral(address(sepoliaWETHMockToken),amountToWithdraw);
// vm.stopPrank();

// vm.expectRevert();
// vaultManager.depositCollateral(address(sepoliaWETHMockToken), 1 ether);

// }

// function testWithdrawPartOfCollateral() public {
// vm.startPrank(borrower);
// sepoliaWETHMockToken.approveInternal(address(vaultManager), 1 ether);
// vaultManager.depositCollateral(address(sepoliaWETHMockToken), 1 ether);
// vaultManager.mintPLST(address(sepoliaWETHMockToken), vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken)));
// stabilskiToken.approve(address(vaultManager), 5000 ether);
// vaultManager.repayPLST(address(sepoliaWETHMockToken), 5000 ether);
// vm.expectRevert();
// vaultManager.withdrawCollateral(address(sepoliaWETHMockToken), 0.9 ether);

// vaultManager.withdrawCollateral(address(sepoliaWETHMockToken), 1e17);


// vm.stopPrank();
// }

// function testRevertLiquidation() public {
//     vm.startPrank(borrower);
// sepoliaWETHMockToken.approveInternal(address(vaultManager), 1 ether);
// vaultManager.depositCollateral(address(sepoliaWETHMockToken), 1 ether);
// vaultManager.mintPLST(address(sepoliaWETHMockToken), vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken)));
// vm.stopPrank();

// vm.startPrank(liquidator);
// vm.expectRevert();
// vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));
// vm.stopPrank();
// }

// function testAddAndUpdateNewToken() public {
// collateralManager.addCollateralType(address(sepoliaWBTCMockToken), vm.envAddress("ETH_BTC_USD"), 135e16, 4e18, 10);
// collateralManager.updateCollateral(address(sepoliaWBTCMockToken), vm.envAddress("ETH_BTC_USD"), 125e16);

// vm.expectRevert();
// collateralManager.updateCollateral(address(stabilskiToken), vm.envAddress("ETH_BTC_USD"), 125e16);

// vm.expectRevert();
// collateralManager.updateCollateral(address(0), vm.envAddress("ETH_BTC_USD"), 125e16);

// vm.expectRevert();
// collateralManager.updateCollateral(address(stabilskiToken), address(0), 125e16);

// vm.expectRevert();
// collateralManager.updateCollateral(address(stabilskiToken), vm.envAddress("ETH_BTC_USD"), 0);
// }

// function testMintBurnPLSTProperties() public {

//     stabilskiToken.mint(address(borrower), 1e18);

//     vm.expectRevert();
//     stabilskiToken.burn(address(borrower), 1e18);

//     vm.expectRevert();
//     stabilskiToken.burnFrom(address(borrower), 1e18);
  

//     vm.startPrank(address(vaultManager));
//     stabilskiToken.grantControllerRole(borrower);

//     stabilskiToken.mint(borrower, 1e18);
//     vm.stopPrank();

// // Give approval from the borrower to vaultManager
// vm.startPrank(borrower);
// stabilskiToken.approve(address(vaultManager), 1e18);
// vm.stopPrank();

// // Now vaultManager can burnFrom
// vm.startPrank(address(vaultManager));
// stabilskiToken.burnFrom(borrower, 1e18);
// vm.stopPrank();


// vm.prank(borrower);
// vm.expectRevert();
// stabilskiToken.burnFrom(address(borrower), 1e18);


// vm.prank(address(vaultManager));
// stabilskiToken.revokeControllerRole(address(borrower));

// vm.expectRevert();
// stabilskiToken.grantControllerRole(address(borrower));

// vm.expectRevert();
// stabilskiToken.revokeControllerRole(address(borrower));


// stabilskiToken.decimals();
// stabilskiToken.getCCIPAdmin();
// stabilskiToken.symbol();
// stabilskiToken.totalSupply();
// stabilskiToken.name();


// }
// function testMockERC20Functions() public {

// vm.startPrank(borrower);
// sepoliaWETHMockToken.mint(borrower, 12 ether);
// sepoliaWETHMockToken.decimals();
// sepoliaWETHMockToken.name();
// sepoliaWETHMockToken.symbol();
// sepoliaWETHMockToken.totalSupply();
// vm.stopPrank();
// }


// function testLiqudationProcess() public {
// vm.startPrank(borrower);
// sepoliaWETHMockToken.approveInternal(address(vaultManager), 1 ether);
// vaultManager.depositCollateral(address(sepoliaWETHMockToken), 1 ether);
// vaultManager.mintPLST(address(sepoliaWETHMockToken), vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken)));

// (, uint256 debt,,)=vaultManager.getVaultInfo(borrower, address(sepoliaWETHMockToken));


// vm.expectRevert();
// vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));

// stabilskiToken.approve(address(vaultManager), debt);
// vm.expectRevert(VaultManager.LiquidatorCannotBeVaultOwner.selector);
// vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));


// vm.stopPrank();



// vm.startPrank(liquidator);
// sepoliaWETHMockToken.approveInternal(address(vaultManager), 10e20);
// vaultManager.depositCollateral(address(sepoliaWETHMockToken), 10e20);
// uint256 amountToMint = vaultManager.getMaxBorrowableStabilskiTokens(liquidator, address(sepoliaWETHMockToken));
// vaultManager.mintPLST(address(sepoliaWETHMockToken), amountToMint);



// stabilskiToken.approve(address(vaultManager), debt);
// vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));
// vm.stopPrank();
// }


// function testProtocolFlowForWBTC() public {
// vm.selectFork(sepoliaEthFork);

// vm.startPrank(borrower);
// sepoliaWBTCMockToken.approveInternal(address(vaultManager), 10e8);
// vaultManager.depositCollateral(address(sepoliaWBTCMockToken), 10e8);

// console.log("Collateral deposited: ", vaultManager.getCollateralValue(borrower, address(sepoliaWBTCMockToken)));
// uint256 amountToMint = vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWBTCMockToken));
// console.log("Amount to mint: ", amountToMint);

// vm.stopPrank();

// }


function testFunctioningOfTokenPools() public {
console.log("Owner of stabilskiToken", stabilskiToken.owner());
console.log("VaultManager address", address(vaultManager));

// Grant the role of burner and minter on sepolia ethereum testnet
vm.startPrank(address(vaultManager));
stabilskiToken.grantControllerRole(borrower);
stabilskiToken.grantControllerRole(address(stabilskiTokenPool));
stabilskiToken.grantControllerRole(address(ArbitrumstabilskiTokenPool));
stabilskiToken.grantControllerRole(address(ArbitrumvaultManager));
stabilskiToken.setNewCCIPAdmin(borrower);
stabilskiToken.transferOwnership(borrower);
vm.stopPrank();

// Admin role is granted to the borrower on the sepolia fork for CCIP
RegistryModuleOwnerCustom registryModuleOwnerCustomEthSepolia =
            RegistryModuleOwnerCustom(ethSepoliaNetworkDetails.registryModuleOwnerCustomAddress);

vm.prank(borrower);
        registryModuleOwnerCustomEthSepolia.registerAdminViaGetCCIPAdmin(address(stabilskiToken));

// Switch to arbitrum fork
vm.selectFork(arbitrumSepoliaFork);
// Grant the borrower the role of burner and minter on arbitrum sepolia testnet and ownership.
vm.startPrank(address(ArbitrumvaultManager));
ArbitrumstabilskiToken.grantControllerRole(borrower);
ArbitrumstabilskiToken.setNewCCIPAdmin(borrower);
ArbitrumstabilskiToken.transferOwnership(borrower);
vm.stopPrank();

// Register the borrower as the admin on the arbitrum sepolia fork for CCIP
RegistryModuleOwnerCustom registryModuleOwnerCustomArbSepolia =
            RegistryModuleOwnerCustom(arbSepoliaNetworkDetails.registryModuleOwnerCustomAddress);


vm.prank(borrower);
        registryModuleOwnerCustomArbSepolia.registerAdminViaGetCCIPAdmin(address(ArbitrumstabilskiToken));

// Switch back to sepolia eth fork and set the pools for the tokens.
vm.selectFork(sepoliaEthFork);
// set the token admin registry for the sepolia eth fork
    TokenAdminRegistry tokenAdminRegistryEthSepolia =
            TokenAdminRegistry(ethSepoliaNetworkDetails.tokenAdminRegistryAddress);
  vm.startPrank(borrower);
        tokenAdminRegistryEthSepolia.acceptAdminRole(address(stabilskiToken));
        vm.stopPrank();

// Switch to arbitrum fork
vm.selectFork(arbitrumSepoliaFork);

// set the token admin registry for the arbitrum sepolia fork

    TokenAdminRegistry tokenAdminRegistryArbSepolia =
            TokenAdminRegistry(arbSepoliaNetworkDetails.tokenAdminRegistryAddress);

  vm.startPrank(borrower);
        tokenAdminRegistryArbSepolia.acceptAdminRole(address(ArbitrumstabilskiToken));
        vm.stopPrank();

// Switch to sepolia and arbitrum and set the pools for the tokens.
        vm.selectFork(sepoliaEthFork);
        vm.prank(borrower);
        tokenAdminRegistryEthSepolia.setPool(address(stabilskiToken), address(stabilskiTokenPool));

        vm.selectFork(arbitrumSepoliaFork);
        vm.prank(borrower);
        tokenAdminRegistryArbSepolia.setPool(address(ArbitrumstabilskiToken), address(ArbitrumstabilskiTokenPool));

        vm.selectFork(sepoliaEthFork);
        
        vm.startPrank(stabilskiTokenPool.owner());
        TokenPool.ChainUpdate[] memory chains = new TokenPool.ChainUpdate[](1);
        bytes[] memory remotePoolAddressesEthSepolia = new bytes[](1);
        remotePoolAddressesEthSepolia[0] = abi.encode(address(stabilskiTokenPool));
        chains[0] = TokenPool.ChainUpdate({
            remoteChainSelector: arbitrumChainSelector,
            allowed:true,
            remotePoolAddress: remotePoolAddressesEthSepolia[0],
            remoteTokenAddress: abi.encode(address(ArbitrumstabilskiToken)),
            outboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 100_000, rate: 167}),
            inboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 100_000, rate: 167})
        });

        stabilskiTokenPool.applyChainUpdates(chains);
        vm.stopPrank();


vm.selectFork(arbitrumSepoliaFork);
        
        vm.startPrank(ArbitrumstabilskiTokenPool.owner());
        TokenPool.ChainUpdate[] memory arbitrumSepoliaPoolChains = new TokenPool.ChainUpdate[](1);
         bytes[] memory remotePoolAddressesArbSepolia = new bytes[](1);
        remotePoolAddressesArbSepolia[0] = abi.encode(address(ArbitrumstabilskiTokenPool));
   
        arbitrumSepoliaPoolChains[0] = TokenPool.ChainUpdate({
            remoteChainSelector: ethSepoliaNetworkDetails.chainSelector,
            allowed:true,
            remotePoolAddress: remotePoolAddressesArbSepolia[0],
            remoteTokenAddress: abi.encode(address(stabilskiToken)),
            outboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 10e18, rate: 167}),
            inboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 10e18, rate: 167})
        });

        ArbitrumstabilskiTokenPool.applyChainUpdates(arbitrumSepoliaPoolChains);


        vm.stopPrank();

vm.selectFork(sepoliaEthFork);

    address linkSepolia = ethSepoliaNetworkDetails.linkAddress;
    ccipLocalSimulatorFork.requestLinkFromFaucet(address(borrower), 
    20e18);

    uint256 amountToSend = 1e2;
   
    

    vm.startPrank(borrower);
    stabilskiToken.mint(borrower, amountToSend * 5);
      IERC20(linkSepolia).approve(
        address(ethSepoliaNetworkDetails.routerAddress)
        , 
        20e18);
     
  

    uint256 balanceOfAliceBeforeEthSepolia = stabilskiToken.balanceOf(borrower);


    console.log("Balance of Alice before Eth Sepolia: ", balanceOfAliceBeforeEthSepolia);
   stabilskiToken.approve(address(stabilskiTokenSenderSepoliaEth), amountToSend);
         console.log("Allowance for stabilskiToken: ", stabilskiToken.allowance(borrower, address(stabilskiTokenSenderSepoliaEth)));
         


    vm.stopPrank();

vm.prank(address(stabilskiTokenSenderSepoliaEth));
stabilskiToken.transferFrom(borrower, address(stabilskiTokenSenderSepoliaEth), amountToSend);
console.log("Balance of stabilskiTokenSenderEthSepolia: ", stabilskiToken.balanceOf(address(stabilskiTokenSenderSepoliaEth)));

vm.startPrank(address(stabilskiTokenSenderSepoliaEth));
stabilskiToken.approve(address(ethSepoliaNetworkDetails.routerAddress), amountToSend / 2);
stabilskiToken.approve(address(stabilskiTokenPool), amountToSend / 2);
console.log("Allowance for stabilskiToken: ", stabilskiToken.allowance(address(stabilskiTokenSenderSepoliaEth), address(ethSepoliaNetworkDetails.routerAddress)));
vm.stopPrank();


vm.startPrank(borrower);
   console.log(stabilskiToken.balanceOf(address(stabilskiTokenSenderSepoliaEth)), "Stabilski Balance of sender Eth Sepolia !");

uint256 feeToPay= stabilskiTokenSenderSepoliaEth.getFee(
         address(stabilskiToken),
        arbSepoliaNetworkDetails.chainSelector,
        address(ArbitrumstabilskiToken),
        borrower,
        amountToSend / 2,
        address(0)
);
console.log("Fee to pay: ", feeToPay);

    stabilskiTokenSenderSepoliaEth.bridgeTokens
    {value: feeToPay}
    (
        address(stabilskiToken),
        arbSepoliaNetworkDetails.chainSelector,
        address(ArbitrumstabilskiToken),
        borrower,
        amountToSend / 2,
        address(0)
    );

vm.stopPrank();

    uint256 balanceOfAliceAfterEthSepolia = stabilskiToken.balanceOf(borrower);
    assertEq(balanceOfAliceAfterEthSepolia, balanceOfAliceBeforeEthSepolia - amountToSend);

    ccipLocalSimulatorFork.switchChainAndRouteMessage(arbitrumSepoliaFork);

    uint256 balanceOfAliceAfterBaseSepolia = ArbitrumstabilskiToken.balanceOf(borrower);
    assertEq(balanceOfAliceAfterBaseSepolia, amountToSend);


}


}