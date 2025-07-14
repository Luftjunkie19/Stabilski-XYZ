// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BurnMintTokenPool
} from "../../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/pools/BurnMintTokenPool.sol";

import {Pool}  from "../../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/libraries/Pool.sol";
import {RateLimiter} from "../../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/libraries/RateLimiter.sol";

import {Ownable} from "../../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {EnumerableSet} from "../../lib/openzeppelin-contracts/contracts/utils/structs/EnumerableSet.sol";
import {ConfirmedOwnerWithProposal} from "../../lib/chainlink-brownie-contracts/contracts/src/v0.8/shared/access/ConfirmedOwnerWithProposal.sol";
import {StabilskiTokenInterface} from "../interfaces/StabilskiTokenInterface.sol";
import {IRouter} from "../../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/interfaces/IRouter.sol";
import {ERC20} from "../../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";


import {IBurnMintERC20} from "../../lib/chainlink-brownie-contracts/contracts/src/v0.8/shared/token/ERC20/IBurnMintERC20.sol";
contract StabilskiTokenPool is  BurnMintTokenPool, Ownable {

using RateLimiter for RateLimiter.TokenBucket;

error NotOwnerSender();
constructor(
    address token,
    uint8 localTokenDecimals,
    address[] memory allowList,
    address rmnProxy,
    address router
) BurnMintTokenPool(IBurnMintERC20(token), allowList, rmnProxy, router) Ownable(router) {
}

modifier onlyOwner() override(Ownable, ConfirmedOwnerWithProposal) {
if(Ownable.owner() != _msgSender()){
    revert NotOwnerSender();
}
    _;
}

function lockOrBurn(
  Pool.LockOrBurnInV1 calldata lockOrBurnIn
) external virtual override returns (Pool.LockOrBurnOutV1 memory){
  _validateLockOrBurn(lockOrBurnIn);

StabilskiTokenInterface(address(i_token)).burn(lockOrBurnIn.originalSender, lockOrBurnIn.amount);

  emit Burned(lockOrBurnIn.originalSender, lockOrBurnIn.amount);

  return Pool.LockOrBurnOutV1({
    destTokenAddress: lockOrBurnIn.receiver,
    destPoolData: abi.encode(lockOrBurnIn)
  });
}

function balanceOf(address account) external view returns (uint256){
    return i_token.balanceOf(account);
}

function owner() public override(ConfirmedOwnerWithProposal, Ownable) view returns (address){
  return super.owner();
}
 
function _transferOwnership(address newOwner) internal override(ConfirmedOwnerWithProposal, Ownable) {
  super._transferOwnership(newOwner);
}

function transferOwnership(address newOwner) public override(ConfirmedOwnerWithProposal, Ownable) onlyOwner{
  _transferOwnership(newOwner);
}

function releaseOrMint(Pool.ReleaseOrMintInV1 calldata releaseOrMintIn) external override
 returns (Pool.ReleaseOrMintOutV1 memory){
  _validateReleaseOrMint(releaseOrMintIn);
StabilskiTokenInterface(address(i_token)).mint(releaseOrMintIn.receiver, releaseOrMintIn.amount);

  emit Minted(address(0), releaseOrMintIn.receiver, releaseOrMintIn.amount);

  return Pool.ReleaseOrMintOutV1({
    destinationAmount: releaseOrMintIn.amount
  });
}

function getRemoteToken() external view returns (address){
    return address(i_token);
}



}