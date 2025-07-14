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
import {CCIPLocalSimulator} from "../lib/chainlink-local/src/ccip/CCIPLocalSimulator.sol";

import {RateLimiter} from "../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/libraries/RateLimiter.sol";
import { TokenPool} from "../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/pools/BurnMintTokenPool.sol";

import {TokenAdminRegistry} from "../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/tokenAdminRegistry/TokenAdminRegistry.sol";
import {Register} from "../lib/chainlink-local/src/ccip/Register.sol";
import {RegistryModuleOwnerCustom} from
    "../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/tokenAdminRegistry/RegistryModuleOwnerCustom.sol";
import {
    CCIPLocalSimulator,
    IRouterClient,
    LinkToken
} from "@chainlink/local/src/ccip/CCIPLocalSimulator.sol";
import {Pool}  from "../../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/libraries/Pool.sol";

import {DeployReceiverAndSender} from "../script/DeployReceiverAndSender.sol";
import {StabilskiTokenReceiver} from "../src/cross-chain-management/StabilskiTokenReceiver.sol";
import {StabilskiTokenSender} from "../src/cross-chain-management/StabilskiTokenSender.sol";
import {CCIPLocalSimulatorFork, Register} from "@chainlink/local/src/ccip/CCIPLocalSimulatorFork.sol";

contract TestContract is Test {

uint256 sepoliaEthFork;
uint256 arbitrumSepoliaFork;
CCIPLocalSimulator ccipLocalSimulator;



VaultManager vaultManager;
StabilskiToken stabilskiToken;
USDPLNOracle usdPlnOracle;
CollateralManager collateralManager;
StabilskiTokenPool stabilskiTokenPool;
ERC20Mock sepoliaWETHMockToken;
ERC20Mock sepoliaWBTCMockToken;
ERC20Mock sepoliaWLINKMockToken;

VaultManager ArbitrumvaultManager;
StabilskiToken ArbitrumstabilskiToken;
USDPLNOracle ArbitrumusdPlnOracle;
CollateralManager ArbitrumcollateralManager;
StabilskiTokenPool ArbitrumstabilskiTokenPool;
ERC20Mock arbitrumLINKMockToken;

   IRouterClient router;
    uint64 destinationChainSelector;
    LinkToken linkToken;

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

CCIPLocalSimulatorFork ccipLocalSimulatorFork;


function setUp() public {
sepoliaEthFork=vm.createSelectFork("ETH_SEPOLIA_RPC_URL");
ccipLocalSimulator = new CCIPLocalSimulator();

(uint64 chainSelector, IRouterClient sourceRouter,,, LinkToken link,,) = ccipLocalSimulator.configuration();

 router = sourceRouter;
        destinationChainSelector = chainSelector;
        linkToken = link;


        ccipLocalSimulatorFork = new CCIPLocalSimulatorFork();
        vm.makePersistent(address(ccipLocalSimulatorFork));

arbitrumSepoliaFork=vm.createFork("ARB_SEPOLIA_RPC_URL");

wethInvalidAddress = vm.envAddress("SEPOLIA_ETH_WETH_ADDR");


address[] memory tokens;
address[] memory whitelist;
address[] memory priceFeeds;
uint256[] memory minCollateralRatios;

vm.makePersistent(address(ccipLocalSimulator));

sepoliaWETHMockToken = new ERC20Mock("WETH", "WETH", borrower,liquidator, 1000 ether, 18);
sepoliaWBTCMockToken = new ERC20Mock("WBTC", "WBTC", borrower,liquidator, 1000 ether, 8);
sepoliaWLINKMockToken = new ERC20Mock("LINK", "LINK", borrower,liquidator, 1000 ether, 18);


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
(vaultManager, stabilskiToken, usdPlnOracle, collateralManager, stabilskiTokenPool) = deployContracts.run(tokens, whitelist, priceFeeds, minCollateralRatios);

vm.makePersistent(address(usdPlnOracle));

vm.deal(borrower, 1000 ether);


vm.selectFork(arbitrumSepoliaFork);
arbitrumLINKMockToken=new ERC20Mock("LINK", "LINK", borrower,liquidator, 1000 ether, 18);
tokens = new address[](1);
priceFeeds = new address[](1) ;
minCollateralRatios = new uint256[](1) ;

tokens[0]=address(arbitrumLINKMockToken);
priceFeeds[0]=vm.envAddress("ARBITRUM_LINK_USD_RATE");
minCollateralRatios[0]=12e17;


DeployContracts deployContractsArbitrum = new DeployContracts();
(ArbitrumvaultManager, ArbitrumstabilskiToken, ArbitrumusdPlnOracle, ArbitrumcollateralManager, ArbitrumstabilskiTokenPool) = deployContractsArbitrum.run(tokens, whitelist, priceFeeds, minCollateralRatios);


DeployReceiverAndSender deployReceiverAndSenderArbitrum = new DeployReceiverAndSender();

(stabilskiTokenReceiverSepoliaArbitrum, stabilskiTokenSenderSepoliaArbitrum) = deployReceiverAndSenderArbitrum.run(
vm.envAddress("ARBITRUM_CCIP_ROUTER"),
address(ArbitrumstabilskiTokenPool),
address(stabilskiTokenPool),
address(stabilskiToken)
);

vm.selectFork(sepoliaEthFork);
DeployReceiverAndSender deployReceiverAndSender = new DeployReceiverAndSender();

(stabilskiTokenReceiverSepoliaEth, stabilskiTokenSenderSepoliaEth) = deployReceiverAndSender.run(
vm.envAddress("ETH_CCIP_ROUTER"),
address(stabilskiTokenPool),
address(ArbitrumstabilskiTokenPool),
address(ArbitrumstabilskiToken)
);

}


function testCheckBalanceOfBorrower() public  {
vm.prank(borrower);

assertGt(sepoliaWETHMockToken.balanceOf(borrower), 0);
assertGt(sepoliaWBTCMockToken.balanceOf(borrower), 0);
assertGt(sepoliaWLINKMockToken.balanceOf(borrower), 0);
}

function testGetCollateralInfo() public {
vm.expectRevert();
(address priceInvaliedFeed,,,,) =  collateralManager.getCollateralInfo(address(0));

// Valid token

(address priceFeed,
,
,
,) =  collateralManager.getCollateralInfo(address(sepoliaWBTCMockToken));

assertEq(priceFeed, vm.envAddress("ETH_BTC_USD"));

collateralManager.toggleCollateral(address(sepoliaWBTCMockToken));

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

assertGt(price, 0);
}

function testOracleCallsTheAPI() public  {
usdPlnOracle.sendRequest();

usdPlnOracle.subscriptionId;
usdPlnOracle.s_lastError;
usdPlnOracle.s_lastFinalizationTimestamp;
usdPlnOracle.s_subscriptionIds;
usdPlnOracle.getTheSource();
usdPlnOracle.performUpkeep(bytes(""));


vm.warp(block.timestamp + usdPlnOracle.interval());
assertGt(usdPlnOracle.getPLNPrice(), 0);

}

function testTestUSDPLNOracle() public  {
    USDPLNOracle usdpln =  new USDPLNOracle(vm.envAddress("ETH_ROUTER"), bytes32("fun-ethereum-sepolia-1"), 5286);

    usdpln.s_subscriptionIds;
    usdpln.s_lastFinalizationTimestamp;
    usdpln.interval();
    usdpln.subscriptionId;
    usdpln.getTheSource();
  
}

function testDepositInvalidToken() public  {
vm.startPrank(borrower);
sepoliaWETHMockToken.approveInternal(address(vaultManager), 1000 ether);
vm.expectRevert();
vaultManager.depositCollateral(address(
    wethInvalidAddress
), 1000 ether);

vm.stopPrank();
}

function testDepositCollateral() public  {
vm.startPrank(borrower);
sepoliaWETHMockToken.approveInternal(address(vaultManager), 100 ether);
vaultManager.depositCollateral(address(sepoliaWETHMockToken), 100 ether);
assertEq(sepoliaWETHMockToken.balanceOf(borrower), 900 ether);
vm.stopPrank();

(uint256 collateralAmount, uint256 debt, address collateralToken, uint256 healthFactor)
=vaultManager.getVaultInfo(borrower, address(sepoliaWETHMockToken));

assertGt(collateralAmount, 0);
assertEq(debt, 0);
assertEq(collateralToken, address(sepoliaWETHMockToken));
assertGt(healthFactor, 0);

uint256 maxBorrowable =vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken));

assertGt(maxBorrowable, 0);
}

function testDepositAndGetStabilskiTokens() public {

stabilskiTokenReceiverSepoliaEth.supportsInterface(bytes4(abi.encode(address(stabilskiToken))));
stabilskiTokenReceiverSepoliaEth.getRouter();
vm.startPrank(borrower);
sepoliaWETHMockToken.approveInternal(address(vaultManager), 10e18);
vaultManager.depositCollateral(address(sepoliaWETHMockToken), 10e18);

assertGt(vaultManager.getCollateralValue(borrower, address(sepoliaWETHMockToken)), 0);
vm.expectRevert();
vaultManager.mintPLST(address(sepoliaWETHMockToken), 90850000000000000000001);

vaultManager.mintPLST(address(sepoliaWETHMockToken), vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken)));

assertGt(stabilskiToken.balanceOf(borrower), 1e18);

stabilskiToken.approve(address(vaultManager), stabilskiToken.balanceOf(borrower) / 2);
vaultManager.repayPLST(address(sepoliaWETHMockToken), vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken)) / 2);

vm.stopPrank();
}

function testRepayPartOfCollateral() public {
vm.startPrank(borrower);
sepoliaWETHMockToken.approveInternal(address(vaultManager), 1 ether);
vaultManager.depositCollateral(address(sepoliaWETHMockToken), 1 ether);
vaultManager.mintPLST(address(sepoliaWETHMockToken), vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken)));
uint256 stabilskiTokenBalanceBefore = stabilskiToken.balanceOf(borrower);
uint256 healthFactorBefore = vaultManager.getVaultHealthFactor(borrower, address(sepoliaWETHMockToken));

stabilskiToken.approve(address(vaultManager), 5000 ether);
vaultManager.repayPLST(address(sepoliaWETHMockToken), 5000 ether);

assertGt(stabilskiTokenBalanceBefore, stabilskiToken.balanceOf(borrower));
assertLt(healthFactorBefore, vaultManager.getVaultHealthFactor(borrower, address(sepoliaWETHMockToken)));

uint256 amountToWithdraw = (vaultManager.getCollateralValue(borrower, address(sepoliaWETHMockToken)) / usdPlnOracle.getPLNPrice()) * 1e4;

vm.expectRevert();
vaultManager.withdrawCollateral(address(sepoliaWETHMockToken),amountToWithdraw);
vm.stopPrank();

vm.expectRevert();
vaultManager.depositCollateral(address(sepoliaWETHMockToken), 1 ether);

}

function testWithdrawPartOfCollateral() public {
vm.startPrank(borrower);
sepoliaWETHMockToken.approveInternal(address(vaultManager), 1 ether);
vaultManager.depositCollateral(address(sepoliaWETHMockToken), 1 ether);
vaultManager.mintPLST(address(sepoliaWETHMockToken), vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken)));
stabilskiToken.approve(address(vaultManager), 5000 ether);
vaultManager.repayPLST(address(sepoliaWETHMockToken), 5000 ether);
vm.expectRevert();
vaultManager.withdrawCollateral(address(sepoliaWETHMockToken), 0.9 ether);

vaultManager.withdrawCollateral(address(sepoliaWETHMockToken), 1e17);


vm.stopPrank();
}

function testRevertLiquidation() public {
    vm.startPrank(borrower);
sepoliaWETHMockToken.approveInternal(address(vaultManager), 1 ether);
vaultManager.depositCollateral(address(sepoliaWETHMockToken), 1 ether);
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
    vm.expectRevert();
    stabilskiToken.mint(address(borrower), 1e18);
    vm.expectRevert();
    stabilskiToken.burn(address(borrower), 1e18);

    vm.expectRevert();
    stabilskiToken.burnFrom(address(borrower), 1e18);
  

    vm.startPrank(address(vaultManager));
    stabilskiToken.grantControllerRole(borrower);

    stabilskiToken.mint(borrower, 1e18);
    vm.stopPrank();

// Give approval from the borrower to vaultManager
vm.startPrank(borrower);
stabilskiToken.approve(address(vaultManager), 1e18);
vm.stopPrank();

// Now vaultManager can burnFrom
vm.startPrank(address(vaultManager));
stabilskiToken.burnFrom(borrower, 1e18);
vm.stopPrank();


vm.prank(borrower);
vm.expectRevert();
stabilskiToken.burnFrom(address(borrower), 1e18);


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
sepoliaWETHMockToken.mint(borrower, 12 ether);
sepoliaWETHMockToken.decimals();
sepoliaWETHMockToken.name();
sepoliaWETHMockToken.symbol();
sepoliaWETHMockToken.totalSupply();
vm.stopPrank();
}


function testLiqudationProcess() public {
vm.startPrank(borrower);
sepoliaWETHMockToken.approveInternal(address(vaultManager), 1 ether);
vaultManager.depositCollateral(address(sepoliaWETHMockToken), 1 ether);
vaultManager.mintPLST(address(sepoliaWETHMockToken), vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken)));

(, uint256 debt,,)=vaultManager.getVaultInfo(borrower, address(sepoliaWETHMockToken));


vm.expectRevert();
vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));

stabilskiToken.approve(address(vaultManager), debt);
vm.expectRevert(VaultManager.LiquidatorCannotBeVaultOwner.selector);
vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));


vm.stopPrank();



vm.startPrank(liquidator);
sepoliaWETHMockToken.approveInternal(address(vaultManager), 100 ether);
vaultManager.depositCollateral(address(sepoliaWETHMockToken), 100 ether);
vaultManager.mintPLST(address(sepoliaWETHMockToken), vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWETHMockToken)));



stabilskiToken.approve(address(vaultManager), debt);
vaultManager.liquidateVault(borrower, address(sepoliaWETHMockToken));
vm.stopPrank();
}

function testFunctioningOfTokenPools() public {
// Grant the role of burner and minter on sepolia ethereum testnet
vm.startPrank(address(vaultManager));
stabilskiToken.grantControllerRole(borrower);
stabilskiToken.grantControllerRole(address(stabilskiTokenPool));
stabilskiToken.grantControllerRole(address(ArbitrumstabilskiTokenPool));
stabilskiToken.grantControllerRole(address(ArbitrumvaultManager));
stabilskiToken.transferOwnership(borrower);
vm.stopPrank();

          ethSepoliaNetworkDetails   = ccipLocalSimulatorFork.getNetworkDetails(block.chainid);

RegistryModuleOwnerCustom registryModuleOwnerCustomEthSepolia =
            RegistryModuleOwnerCustom(ethSepoliaNetworkDetails.registryModuleOwnerCustomAddress);

vm.prank(borrower);
stabilskiToken.setNewCCIPAdmin(address(borrower));

vm.prank(borrower);
        registryModuleOwnerCustomEthSepolia.registerAdminViaGetCCIPAdmin(address(stabilskiToken));



vm.selectFork(arbitrumSepoliaFork);
vm.startPrank(address(ArbitrumvaultManager));
ArbitrumstabilskiToken.grantControllerRole(borrower);
ArbitrumstabilskiToken.transferOwnership(borrower);
vm.stopPrank();

          arbSepoliaNetworkDetails   = ccipLocalSimulatorFork.getNetworkDetails(block.chainid);
RegistryModuleOwnerCustom registryModuleOwnerCustomArbSepolia =
            RegistryModuleOwnerCustom(arbSepoliaNetworkDetails.registryModuleOwnerCustomAddress);

vm.prank(borrower);
ArbitrumstabilskiToken.setNewCCIPAdmin(address(borrower));

vm.prank(borrower);
        registryModuleOwnerCustomArbSepolia.registerAdminViaGetCCIPAdmin(address(ArbitrumstabilskiToken));
   

vm.selectFork(sepoliaEthFork);

    TokenAdminRegistry tokenAdminRegistryEthSepolia =
            TokenAdminRegistry(ethSepoliaNetworkDetails.tokenAdminRegistryAddress);

  vm.startPrank(borrower);
        tokenAdminRegistryEthSepolia.acceptAdminRole(address(stabilskiToken));
        vm.stopPrank();

vm.selectFork(arbitrumSepoliaFork);

    TokenAdminRegistry tokenAdminRegistryArbSepolia =
            TokenAdminRegistry(arbSepoliaNetworkDetails.tokenAdminRegistryAddress);

  vm.startPrank(borrower);
        tokenAdminRegistryArbSepolia.acceptAdminRole(address(ArbitrumstabilskiToken));
        vm.stopPrank();

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
            remoteChainSelector: uint64(sepoliaEthFork),
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
            remoteChainSelector: uint64(arbitrumSepoliaFork),
            allowed:true,
            remotePoolAddress: remotePoolAddressesArbSepolia[0],
            remoteTokenAddress: abi.encode(address(stabilskiToken)),
            outboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 100_000, rate: 167}),
            inboundRateLimiterConfig: RateLimiter.Config({isEnabled: true, capacity: 100_000, rate: 167})
        });

        ArbitrumstabilskiTokenPool.applyChainUpdates(arbitrumSepoliaPoolChains);


        vm.stopPrank();

vm.selectFork(arbitrumSepoliaFork);
        vm.startPrank(borrower);
    arbitrumLINKMockToken.approveInternal(address(ArbitrumvaultManager), 1 ether);
    ArbitrumvaultManager.depositCollateral(address(arbitrumLINKMockToken), 1 ether);
    ArbitrumvaultManager.mintPLST(address(arbitrumLINKMockToken),
        ArbitrumvaultManager.getMaxBorrowableStabilskiTokens(borrower, address(arbitrumLINKMockToken)));
vm.stopPrank();


vm.selectFork(sepoliaEthFork);
        vm.startPrank(borrower);
    sepoliaWLINKMockToken.approveInternal(address(vaultManager), 1 ether);
    vaultManager.depositCollateral(address(sepoliaWLINKMockToken), 1 ether);
    vaultManager.mintPLST(address(sepoliaWLINKMockToken),
        vaultManager.getMaxBorrowableStabilskiTokens(borrower, address(sepoliaWLINKMockToken)));
vm.stopPrank();


vm.selectFork(arbitrumSepoliaFork);

vm.startPrank(borrower);
ArbitrumstabilskiToken.grantControllerRole(address(liquidator));
ArbitrumstabilskiToken.grantControllerRole(address(stabilskiTokenSenderSepoliaArbitrum));
ArbitrumstabilskiToken.grantControllerRole(address(stabilskiTokenPool));
vm.stopPrank();

assertGt(ArbitrumstabilskiToken.balanceOf(borrower), 0);

vm.prank(borrower);
stabilskiTokenSenderSepoliaArbitrum.bridgeTokens{value:1000 ether}(
    uint64(vm.envUint("ETH_CCIP_CHAIN_SELECTOR")),
    address(ArbitrumstabilskiToken),
    liquidator,
    ArbitrumstabilskiToken.balanceOf(borrower) / 10
);




}


}