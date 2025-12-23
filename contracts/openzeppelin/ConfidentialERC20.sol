// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Confidential ERC20 Token (ERC7984 Implementation)
/// @dev Implements a confidential token standard where balances are encrypted
/// @notice This is a simplified implementation of the ERC7984 standard
contract ConfidentialERC20 is SepoliaConfig {

    string public name;
    string public symbol;
    uint8 public decimals;

    mapping(address => euint64) private _balances;
    mapping(address => mapping(address => euint64)) private _allowances;

    euint64 private _totalSupply;

    event Transfer(address indexed from, address indexed to);
    event Approval(address indexed owner, address indexed spender);
    event Mint(address indexed to, uint64 amount);

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    /// @dev Get encrypted balance of an account
    function balanceOf(address account) external view returns (euint64) {
        return _balances[account];
    }

    /// @dev Get total supply (encrypted)
    function totalSupply() external view returns (euint64) {
        return _totalSupply;
    }

    /// @dev Transfer encrypted amount to recipient
    function transfer(
        address to,
        externalEuint64 encryptedAmount,
        bytes calldata proof
    ) external returns (bool) {
        euint64 amount = FHE.fromExternal(encryptedAmount, proof);

        _transfer(msg.sender, to, amount);
        return true;
    }

    /// @dev Approve spender to spend encrypted amount
    function approve(
        address spender,
        externalEuint64 encryptedAmount,
        bytes calldata proof
    ) external returns (bool) {
        euint64 amount = FHE.fromExternal(encryptedAmount, proof);

        _approve(msg.sender, spender, amount);
        return true;
    }

    /// @dev Transfer from one account to another using allowance
    function transferFrom(
        address from,
        address to,
        externalEuint64 encryptedAmount,
        bytes calldata proof
    ) external returns (bool) {
        euint64 amount = FHE.fromExternal(encryptedAmount, proof);

        // Check and update allowance
        euint64 currentAllowance = _allowances[from][msg.sender];
        require(FHE.isInitialized(currentAllowance), "No allowance");

        // Subtract from allowance (simplified - production should check sufficiency)
        _allowances[from][msg.sender] = FHE.sub(currentAllowance, amount);

        _transfer(from, to, amount);
        return true;
    }

    /// @dev Get allowance (encrypted)
    function allowance(address owner, address spender) external view returns (euint64) {
        return _allowances[owner][spender];
    }

    /// @dev Mint tokens (only for demonstration - production should have access control)
    function mint(
        address to,
        externalEuint64 encryptedAmount,
        bytes calldata proof
    ) external {
        euint64 amount = FHE.fromExternal(encryptedAmount, proof);

        _balances[to] = FHE.add(_balances[to], amount);
        _totalSupply = FHE.add(_totalSupply, amount);

        FHE.allowThis(_balances[to]);
        FHE.allow(_balances[to], to);

        FHE.allowThis(_totalSupply);

        emit Mint(to, FHE.decrypt(amount));
        emit Transfer(address(0), to);
    }

    /// @dev Internal transfer function
    function _transfer(address from, address to, euint64 amount) internal {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");

        euint64 fromBalance = _balances[from];

        // Subtract from sender (simplified - production should check sufficiency)
        _balances[from] = FHE.sub(fromBalance, amount);

        // Add to recipient
        _balances[to] = FHE.add(_balances[to], amount);

        // Grant permissions
        FHE.allowThis(_balances[from]);
        FHE.allow(_balances[from], from);

        FHE.allowThis(_balances[to]);
        FHE.allow(_balances[to], to);

        emit Transfer(from, to);
    }

    /// @dev Internal approve function
    function _approve(address owner, address spender, euint64 amount) internal {
        require(owner != address(0), "Approve from zero address");
        require(spender != address(0), "Approve to zero address");

        _allowances[owner][spender] = amount;

        FHE.allowThis(amount);
        FHE.allow(amount, spender);

        emit Approval(owner, spender);
    }
}
