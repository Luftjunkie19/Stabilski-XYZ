// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


import {ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

import {SafeERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";

import {ReentrancyGuard} from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

import {Pausable} from "../lib/openzeppelin-contracts/contracts/utils/Pausable.sol";

import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {AccessControl} from "../lib/openzeppelin-contracts/contracts/access/AccessControl.sol";



contract StabilskiToken is ERC20, Ownable, Pausable, AccessControl, ReentrancyGuard {

using SafeERC20 for ERC20;
error NotEnoughPLST();
error NotEnoughUSD();
error NotController();


bytes32 private constant CONTROLLER_ROLE = keccak256("CONTROLLER_ROLE"); 

modifier onlyController() {
    if (!hasRole(CONTROLLER_ROLE, msg.sender)) {
        revert NotController();
    }
    _;
}
    constructor() ERC20("Stabilski Token", "PLST") Ownable(msg.sender) {
       _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Grant admin role to controller
       _grantRole(CONTROLLER_ROLE, msg.sender); // Grant controller role to controller
    }


    function mint(address to, uint256 amount) external onlyController {
        _mint(to, amount);
    }
    function burn(address from, uint256 amount) external onlyController {
        _burn(from, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }
    function unpause() external onlyOwner {
        _unpause();
    }
    

function grantControllerRole(address account) external onlyOwner {
    _grantRole(CONTROLLER_ROLE, account);
    }

function revokeControllerRole(address account) external onlyOwner {
    _revokeRole(CONTROLLER_ROLE, account);
    }

    function transferOwnership(address newOwner) public onlyOwner override {
        _transferOwnership(newOwner);
    }

}