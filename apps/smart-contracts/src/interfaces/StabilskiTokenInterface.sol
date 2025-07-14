// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
interface StabilskiTokenInterface {
  
function mint(address to, uint256 amount) external;
function burn(address from, uint256 amount) external;
function pause() external;
function unpause() external; 
function transfer(address to, uint256 amount) external;
function transferFrom(address from, address to, uint256 amount) external;
function balanceOf(address account) external view returns (uint256);
function grantControllerRole(bytes32 role, address account) external ;
function transferOwnership(address newOwner) external;
function revokeControllerRole(bytes32 role, address account) external ;
function burnFrom(address from, uint256 amount) external;
function burn(uint256 amount) external;
function approve(address spender, uint256 amount) external returns (bool);
function allowance(address owner, address spender) external view returns (uint256);

}