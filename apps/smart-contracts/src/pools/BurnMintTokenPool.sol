// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {TokenPool} from "../../lib/chainlink-ccip/chains/evm/contracts/tokenAdminRegistry/TokenPoolFactory/TokenPoolFactory.sol";

import {Pool}  from "../../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/libraries/Pool.sol";
import {RateLimiter} from "../../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/libraries/RateLimiter.sol";

import {Ownable} from "../../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {EnumerableSet} from "../../lib/openzeppelin-contracts/contracts/utils/structs/EnumerableSet.sol";

import {ConfirmedOwnerWithProposal} from "../../lib/chainlink-brownie-contracts/contracts/src/v0.8/shared/access/ConfirmedOwnerWithProposal.sol";
import {IERC20} from "../../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

import {IRouter} from "../../lib/chainlink-brownie-contracts/contracts/src/v0.8/ccip/interfaces/IRouter.sol";

contract StabilskiTokenPool is  TokenPool, Ownable {

using RateLimiter for RateLimiter.TokenBucket;

error AllowListNotEnabled();
error ChainAlreadyExists(uint64 chainSelector);
error ChainNotAllowed(uint64 remoteChainSelector);
error CursedByRMN();
error InvalidDecimalArgs(uint8 expected, uint8 actual);
error InvalidRemoteChainDecimals(bytes sourcePoolData);
error InvalidRemotePoolForChain(uint64 remoteChainSelector, bytes remotePoolAddress);
error MismatchedArrayLengths();
error OverflowDetected(uint8 remoteDecimals, uint8 localDecimals, uint256 remoteAmount);
error PoolAlreadyAdded(uint64 remoteChainSelector, bytes remotePoolAddress);


event RemotePoolAdded(uint64 indexed remoteChainSelector, bytes remotePoolAddress);
event RemotePoolRemoved(uint64 indexed remoteChainSelector, bytes remotePoolAddress);


struct RemoteChainConfig {
  RateLimiter.TokenBucket outboundRateLimiterConfig;
  RateLimiter.TokenBucket inboundRateLimiterConfig;
  bytes remoteTokenAddress;
  EnumerableSet.Bytes32Set remotePools;
}

IERC20 internal immutable i_token;
uint8 internal immutable i_tokenDecimals;
address internal immutable i_rmnProxy;
bool internal immutable i_allowlistEnabled;
EnumerableSet.AddressSet internal s_allowlist;
IRouter internal s_router;
EnumerableSet.UintSet internal s_remoteChainSelectors;
mapping(uint64 remoteChainSelector => RemoteChainConfig) internal s_remoteChainConfigs;
mapping(bytes32 poolAddressHash => bytes poolAddress) internal s_remotePoolAddresses;

modifier onlyOwner() override(Ownable, ConfirmedOwnerWithProposal) {
    require(Ownable.owner() == _msgSender(), "Ownable: caller is not the owner");
    _;
}

constructor(
    address token,
    uint8 localTokenDecimals,
    address[] memory allowList,
    address rmnProxy,
    address router
) TokenPool(IERC20(token), allowList, rmnProxy, router) Ownable(router) {
  i_token = token;
  i_tokenDecimals = localTokenDecimals;
  for (uint256 i = 0; i < allowList.length; i++) {
    EnumerableSet.add(s_allowlist, allowList[i]);
  }
  i_rmnProxy = rmnProxy;
  s_router = IRouter(router);
}


function lockOrBurn(
  Pool.LockOrBurnInV1 calldata lockOrBurnIn
) external virtual override returns (Pool.LockOrBurnOutV1 memory){
  _validateLockOrBurn(lockOrBurnIn);

i_token.burn(lockOrBurnIn.originalSender, lockOrBurnIn.amount);

  emit Burned(lockOrBurnIn.sender, lockOrBurnIn.amount);

  return Pool.LockOrBurnOutV1({
    receiver: lockOrBurnIn.receiver,
    remoteChainSelector: lockOrBurnIn.remoteChainSelector,
    originalSender: lockOrBurnIn.originalSender,
    amount: lockOrBurnIn.amount,
    localToken: lockOrBurnIn.localToken
  });
}

function balanceOf(address account) external view returns (uint256){
    return i_token.balanceOf(account);
}


function releaseOrMint(Pool.ReleaseOrMintInV1 calldata releaseOrMintIn) external returns (Pool.ReleaseOrMintOutV1 memory){
  _validateReleaseOrMint(releaseOrMintIn);
i_token.mint(releaseOrMintIn.recipient, releaseOrMintIn.amount);

  emit Minted(releaseOrMintIn.originalSender, releaseOrMintIn.recipient, releaseOrMintIn.amount);

  return Pool.ReleaseOrMintOutV1({
    destinationAmount: releaseOrMintIn.amount
  });
}

function _applyAllowListUpdates(address[] memory removes, address[] memory adds) internal override{
  for (uint256 i = 0; i < removes.length; i++) {
    s_allowlist.remove(removes[i]);
    emit AllowListRemove(removes[i]);
  }
  for (uint256 i = 0; i < adds.length; i++) {
    s_allowlist.add(adds[i]);
    emit AllowListAdd(adds[i]);
  }
}

function _onlyOffRamp(uint64 remoteChainSelector) internal override view{
    if(!s_remoteChainSelectors.contains(remoteChainSelector)){
    revert ChainNotAllowed(remoteChainSelector);
  }

  if(msg.sender != s_router){
    revert CallerIsNotARampOnRouter(msg.sender);
  }
}

function _onlyOnRamp(uint64 remoteChainSelector) internal override view{
  if(!s_remoteChainSelectors.contains(remoteChainSelector)){
    revert ChainNotAllowed(remoteChainSelector);
  }

  if(msg.sender != s_router){
    revert CallerIsNotARampOnRouter(msg.sender);
  }
}

function _parseRemoteDecimals(bytes memory sourcePoolData) internal view virtual returns (uint8){
  if(sourcePoolData == bytes(0) || uint8(sourcePoolData) > type(uint8).max()){
    revert InvalidSourcePoolAddress(sourcePoolData);
  }

  return uint8(sourcePoolData);

}

function _setRateLimitConfig(
  uint64 remoteChainSelector,
  RateLimiter.Config memory outboundConfig,
  RateLimiter.Config memory inboundConfig
) internal override {

  s_remoteChainConfigs[remoteChainSelector].outboundRateLimiterConfig = outboundConfig;
  s_remoteChainConfigs[remoteChainSelector].inboundRateLimiterConfig = inboundConfig;
  emit ChainConfigured(remoteChainSelector, outboundConfig, inboundConfig);
}

function _setRemotePool(uint64 remoteChainSelector, bytes memory remotePoolAddress) internal {

if(remotePoolAddress == bytes(0)){
  revert ZeroAddressNotAllowed();
}

if(s_remotePoolAddresses[bytes(remotePoolAddress)] != bytes(0)){
  revert PoolAlreadyAdded(remoteChainSelector, remotePoolAddress);
}

  s_remotePoolAddresses[keccak256(remotePoolAddress)] = remotePoolAddress;
  emit RemotePoolAdded(remoteChainSelector, remotePoolAddress);
}

function addRemotePool(uint64 remoteChainSelector, bytes calldata remotePoolAddress) external onlyOwner{
  _setRemotePool(remoteChainSelector, remotePoolAddress);
  emit RemotePoolAdded(remoteChainSelector, remotePoolAddress);
}

function applyAllowListUpdates(address[] calldata removes, address[] calldata adds) external
override
onlyOwner{
  _applyAllowListUpdates(removes, adds);
}
function applyChainUpdates(
  uint64[] calldata remoteChainSelectorsToRemove,
  ChainUpdate[] calldata chainsToAdd
) external virtual onlyOwner{
  
  for(uint i = 0; i < remoteChainSelectorsToRemove.length; i++){
    s_remoteChainSelectors.remove(remoteChainSelectorsToRemove[i]); 
  }

  for(uint i = 0; i < chainsToAdd.length; i++){
    s_remoteChainSelectors.add(chainsToAdd[i].remoteChainSelector);
  }

}


function getAllowList() external view  override returns (address[] memory){
  return s_allowlist.values();
}

function getAllowListEnabled() external override view returns (bool){
  return i_allowlistEnabled;
}

function getRateLimitAdmin() external view override returns (address){
  return s_rateLimitAdmin;
}

function getRemotePools(uint64 remoteChainSelector) public view returns (bytes[] memory){
  return s_remoteChainConfigs[remoteChainSelector].remotePools.values();
}

function getRemoteToken(uint64 remoteChainSelector) public view override returns (bytes memory){
  return s_remoteChainConfigs[remoteChainSelector].remoteTokenAddress;
}

function getRmnProxy() public view override returns (address rmnProxy){
  return rmnProxy;
}

function getRouter() public view override returns (address router){
  return s_router;
}
function getSupportedChains() public view override returns (uint64[] memory) {
  return s_remoteChainSelectors.values();
}

function isSupportedChain(uint64 remoteChainSelector) public view override returns (bool){
  return s_remoteChainSelectors.contains(remoteChainSelector);
}

function getTokenDecimals() public view virtual returns (uint8 decimals){
  return i_token.decimals();
}

function isRemotePool(uint64 remoteChainSelector, bytes calldata remotePoolAddress) public view returns (bool){
  return s_remotePoolAddresses[keccak256(remotePoolAddress)] != bytes(0);
}

function removeRemotePool(uint64 remoteChainSelector, bytes calldata remotePoolAddress) external onlyOwner{
  _setRemotePool(remoteChainSelector, bytes(0));
  emit RemotePoolRemoved(remoteChainSelector, remotePoolAddress);
}

function setChainRateLimiterConfig(
  uint64 remoteChainSelector,
  RateLimiter.Config memory outboundConfig,
  RateLimiter.Config memory inboundConfig
) external override{
  _setRateLimitConfig(remoteChainSelector, outboundConfig, inboundConfig);
  emit ChainConfigured(remoteChainSelector, outboundConfig, inboundConfig);
}


function setRouter(address newRouter) public onlyOwner override{
  s_router = newRouter;
  emit RouterUpdated(s_router, newRouter);
}

}