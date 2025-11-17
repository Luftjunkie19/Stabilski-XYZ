// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {
    ERC20,
    ERC20Burnable,
    IERC20
} from
    "../lib/ccip/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/extensions/ERC20Burnable.sol";

import {SafeERC20} from "../lib/ccip/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

import {AccessControl} from
    "../lib/ccip/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/access/AccessControl.sol";
import {IBurnMintERC20} from "../lib/ccip/contracts/src/v0.8/shared/token/ERC20/IBurnMintERC20.sol";
contract StabilskiToken is
    ERC20,
    IBurnMintERC20,
    ERC20Burnable,
    AccessControl,
    ReentrancyGuard
{

    using SafeERC20 for ERC20;
    
    error OwnableUnauthorizedAccount(address account);
    error NotController();

    address internal i_CCIPAdmin;
    address private contractOwner;
    bytes32 private constant CONTROLLER_ROLE = keccak256("CONTROLLER_ROLE"); 

    modifier onlyController() {
        if (!hasRole(CONTROLLER_ROLE, msg.sender)) {
            revert NotController();
        }
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != contractOwner) {
            revert OwnableUnauthorizedAccount(msg.sender);
        }
        _;
    }

    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {
        contractOwner = msg.sender;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CONTROLLER_ROLE, msg.sender);
        i_CCIPAdmin = msg.sender;
    }

    function balanceOf(address account) public view override(ERC20, IERC20) returns (uint256) {
        return super.balanceOf(account);
    }

    function totalSupply() public view override(IERC20, ERC20) returns (uint256) {
        return super.totalSupply();
    }

    function transfer(address to, uint256 amount) public virtual override(ERC20, IERC20) returns (bool) {
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public virtual override(ERC20, IERC20) returns (bool success) {
        return super.transferFrom(from, to, amount);
    }

    function mint(address to, uint256 amount) external onlyController {
        _mint(to, amount);
    }

    function burn(uint256 amount) public override(ERC20Burnable, IBurnMintERC20) onlyController {
        super.burn(amount);
    }

    function burnFrom(address from, uint256 amount) public override(ERC20Burnable, IBurnMintERC20) onlyController {
        super.burnFrom(from, amount);
    }

    function burn(address account, uint256 amount) public override onlyController {
        burnFrom(account, amount);
    }

    function grantControllerRole(address account) external onlyOwner {
        _grantRole(CONTROLLER_ROLE, account);
    }

    function revokeControllerRole(address account) external onlyOwner {
        _revokeRole(CONTROLLER_ROLE, account);
    }

    function transferOwnership(address newOwner) public onlyOwner  {
        contractOwner = newOwner;
    }

    function approve(address spender, uint256 value) public virtual override(ERC20, IERC20) returns (bool) {
        return super.approve(spender, value);
    }

    function allowance(address ownerAddress, address spender) public view override(ERC20, IERC20) returns (uint256) {
        return super.allowance(ownerAddress, spender);
    }
    
    function setNewCCIPAdmin(address newAdmin) public onlyOwner {
    i_CCIPAdmin = newAdmin;
    }

    function getCCIPAdmin() public view returns (address) {
        return i_CCIPAdmin;
    }

    // -------- Required Overrides due to multiple inheritance --------

    function _approve(address ownerAddress, address spender, uint256 amount) internal override(ERC20) {
        super._approve(ownerAddress, spender, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20) {
        super._burn(account, amount);
    }

    function _mint(address account, uint256 amount) internal override(ERC20) {
        super._mint(account, amount);
    }

 

    function _spendAllowance(address ownerAddress, address spender, uint256 amount) internal override(ERC20) {
        super._spendAllowance(ownerAddress, spender, amount);
    }

    function _transfer(address from, address to, uint256 amount) internal override(ERC20) {
        super._transfer(from, to, amount);
    }

    function decimals() public view virtual override(ERC20) returns (uint8) {
        return super.decimals();
    }

    function name() public view virtual override(ERC20) returns (string memory) {
        return super.name();
    }

    function symbol() public view virtual override(ERC20) returns (string memory) {
        return super.symbol();
    }

    function owner() public view returns (address) {
        return contractOwner;
    }
}
