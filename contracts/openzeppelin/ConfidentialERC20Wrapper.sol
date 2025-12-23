// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @title Confidential ERC20 Wrapper
/// @dev Wraps standard ERC20 tokens into confidential ERC20 (ERC7984) tokens
/// @notice Allows converting public ERC20 to encrypted balances and vice versa
contract ConfidentialERC20Wrapper is SepoliaConfig {

    IERC20 public underlyingToken;

    string public name;
    string public symbol;
    uint8 public decimals;

    mapping(address => euint64) private _balances;
    euint64 private _totalSupply;

    event Wrap(address indexed account, uint256 amount);
    event Unwrap(address indexed account, uint256 amount);
    event Transfer(address indexed from, address indexed to);

    constructor(
        address _underlyingToken,
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) {
        underlyingToken = IERC20(_underlyingToken);
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    /// @dev Wrap ERC20 tokens into confidential tokens
    /// @param amount Public amount to wrap
    function wrap(uint256 amount) external {
        require(amount > 0, "Amount must be positive");

        // Transfer underlying tokens from user
        require(
            underlyingToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        // Mint encrypted tokens
        euint64 encryptedAmount = FHE.asEuint64(uint64(amount));

        _balances[msg.sender] = FHE.add(_balances[msg.sender], encryptedAmount);
        _totalSupply = FHE.add(_totalSupply, encryptedAmount);

        FHE.allowThis(_balances[msg.sender]);
        FHE.allow(_balances[msg.sender], msg.sender);
        FHE.allowThis(_totalSupply);

        emit Wrap(msg.sender, amount);
    }

    /// @dev Unwrap confidential tokens back to ERC20
    /// @param encryptedAmount Encrypted amount to unwrap
    /// @param proof Input proof for the encrypted amount
    function unwrap(
        externalEuint64 encryptedAmount,
        bytes calldata proof
    ) external {
        euint64 amount = FHE.fromExternal(encryptedAmount, proof);

        // Burn encrypted tokens
        euint64 userBalance = _balances[msg.sender];
        require(FHE.isInitialized(userBalance), "No balance");

        _balances[msg.sender] = FHE.sub(userBalance, amount);
        _totalSupply = FHE.sub(_totalSupply, amount);

        FHE.allowThis(_balances[msg.sender]);
        FHE.allow(_balances[msg.sender], msg.sender);
        FHE.allowThis(_totalSupply);

        // Decrypt and transfer underlying tokens
        uint64 plainAmount = FHE.decrypt(amount);
        require(
            underlyingToken.transfer(msg.sender, plainAmount),
            "Transfer failed"
        );

        emit Unwrap(msg.sender, plainAmount);
    }

    /// @dev Transfer encrypted tokens
    function transfer(
        address to,
        externalEuint64 encryptedAmount,
        bytes calldata proof
    ) external returns (bool) {
        euint64 amount = FHE.fromExternal(encryptedAmount, proof);

        _transfer(msg.sender, to, amount);
        return true;
    }

    /// @dev Get encrypted balance
    function balanceOf(address account) external view returns (euint64) {
        return _balances[account];
    }

    /// @dev Get encrypted total supply
    function totalSupply() external view returns (euint64) {
        return _totalSupply;
    }

    /// @dev Internal transfer function
    function _transfer(address from, address to, euint64 amount) internal {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");

        _balances[from] = FHE.sub(_balances[from], amount);
        _balances[to] = FHE.add(_balances[to], amount);

        FHE.allowThis(_balances[from]);
        FHE.allow(_balances[from], from);

        FHE.allowThis(_balances[to]);
        FHE.allow(_balances[to], to);

        emit Transfer(from, to);
    }
}
