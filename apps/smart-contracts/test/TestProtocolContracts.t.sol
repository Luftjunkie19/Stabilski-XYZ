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

contract TestContract is Test {
uint256 sepoliaEthFork;
uint256 arbitrumEthFork;

VaultManager vaultManager;
StabilskiToken stabilskiToken;
USDPLNOracle usdPlnOracle;
CollateralManager collateralManager;
StabilskiTokenPool stabilskiTokenPool;

address borrower=makeAddr("borrower");
address liquidator=makeAddr("liquidator");

function setUp() public {
sepoliaEthFork=vm.createSelectFork(vm.envString("ETH_SEPOLIA_RPC_URL"));

DeployContracts deployContracts = new DeployContracts();
(vaultManager, stabilskiToken, usdPlnOracle, collateralManager, stabilskiTokenPool) = deployContracts.run();

vm.deal(borrower, 1000 ether);
// ERC20Mock(vm.envAddress("SEPOLIA_ETH_WBTC_ADDR")).mint(borrower, 1000 ether);
}
function testCheckBalanceOfBorrower() public  {
vm.prank(borrower);
ERC20Mock(vm.envAddress("SEPOLIA_ETH_WETH_ADDR")).mint(borrower, 1000 ether);
assertGt(ERC20Mock(vm.envAddress("SEPOLIA_ETH_WETH_ADDR")).balanceOf(borrower), 0);
// assertGt(ERC20Mock(vm.envAddress("SEPOLIA_ETH_WBTC_ADDR")).balanceOf(borrower), 0);
}

function testIsCollateralListEmpty() public view {
assertGt(collateralManager.getCollateralTokens().length, 0);
}

function testGetPriceCollateral() public view {
address[] memory tokens = collateralManager.getCollateralTokens();
uint256 price = collateralManager.getTokenPrice(tokens[2]);

assertGt(price, 0);
}

function testOracleCallsTheAPI() public  {
bytes32 requestId = usdPlnOracle.sendRequest();

vm.warp(block.timestamp + usdPlnOracle.interval());
assertGt(usdPlnOracle.getPLNPrice(), 0);
}

function testSelectForkActive() public view {
    assertEq(sepoliaEthFork, vm.activeFork());
}


function testDepositPublic() public {

vm.prank(borrower);






}


}