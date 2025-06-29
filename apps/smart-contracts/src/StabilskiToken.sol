// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;


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
    constructor(address _controller) ERC20("Stabilski Token", "PLST") Ownable(_controller) {
        grantRole(DEFAULT_ADMIN_ROLE, _controller); // Grant admin role to controller
        grantRole(CONTROLLER_ROLE, _controller); // Grant controller role to controller
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
    

function grantControllerRole(bytes32 role, address account) external onlyOwner {
    _grantRole(role, account);
    }

function revokeControllerRole(bytes32 role, address account) external onlyOwner {
    _revokeRole(role, account);
    }

}