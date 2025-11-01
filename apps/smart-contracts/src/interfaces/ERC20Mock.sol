// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {
    ERC20
} from
    "../../lib/ccip/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/extensions/ERC20Burnable.sol";

import {SafeERC20} from "../../lib/ccip/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";

contract ERC20Mock is ERC20 {
    using SafeERC20 for ERC20;
    uint8 private immutable i_decimals;

    constructor(
        string memory name,
        string memory symbol,
        address initialAccount,
        address liquidatorAddress,
        uint256 initialBalance,
        uint8 decimalPoints
    ) payable ERC20(name, symbol) {
        i_decimals = decimalPoints;
        _mint(initialAccount, initialBalance);
        _mint(liquidatorAddress, initialBalance);
    }

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public {
    super._burn(account, amount);
    }

    function transferInternal(address from, address to, uint256 value) public {
      super.transferFrom(from, to, value);
    }

     
    function approveInternal(address spender, uint256 value) public {
    super.approve(spender, value);
    }

    function allowance(address owner, address spender) public view override returns (uint256) {
        return super.allowance(owner, spender);
    }

    function decimals() public view override returns (uint8) {
        return i_decimals;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return super.balanceOf(account);
    }
}
