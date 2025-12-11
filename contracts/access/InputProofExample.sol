// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, euint32, externalEuint64, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Input Proof Example
/// @dev Demonstrates what input proofs are and why they are needed
/// @notice Input proofs ensure that encrypted inputs are valid and properly authorized
contract InputProofExample is SepoliaConfig {
    
    mapping(address => euint64) private balances;
    
    event BalanceUpdated(address indexed user);
    event TransferCompleted(address indexed from, address indexed to);

    /// @dev Correct usage: Store value with input proof
    /// @param inputBalance External encrypted balance
    /// @param inputProof Zero-knowledge proof proving user knows the plaintext value
    /// @notice The proof ensures the encrypted value is valid and user-authorized
    function storeBalanceCorrect(
        externalEuint64 inputBalance,
        bytes calldata inputProof
    ) external {
        // FHE.fromExternal validates the proof before converting
        euint64 encryptedBalance = FHE.fromExternal(inputBalance, inputProof);
        
        balances[msg.sender] = encryptedBalance;
        FHE.allowThis(encryptedBalance);
        FHE.allow(encryptedBalance, msg.sender);
        
        emit BalanceUpdated(msg.sender);
    }

    /// @dev Example: Why input proofs are needed
    /// @notice Without input proofs, malicious actors could:
    /// 1. Submit arbitrary encrypted values they don't know
    /// 2. Replay encrypted values from other users
    /// 3. Submit invalid ciphertexts that could break operations
    /// The input proof cryptographically proves:
    /// - User knows the plaintext value
    /// - The encryption is valid
    /// - The value is within acceptable range

    /// @dev Transfer with proper input proof validation
    function transfer(
        address to,
        externalEuint64 inputAmount,
        bytes calldata amountProof
    ) external {
        euint64 amount = FHE.fromExternal(inputAmount, amountProof);
        
        euint64 senderBalance = balances[msg.sender];
        
        // Ensure sender has sufficient balance (encrypted comparison)
        // Note: In production, handle underflow properly
        balances[msg.sender] = FHE.sub(senderBalance, amount);
        balances[to] = FHE.add(balances[to], amount);
        
        FHE.allowThis(balances[msg.sender]);
        FHE.allow(balances[msg.sender], msg.sender);
        
        FHE.allowThis(balances[to]);
        FHE.allow(balances[to], to);
        
        emit TransferCompleted(msg.sender, to);
    }

    /// @dev Get balance
    function getBalance() external view returns (euint64) {
        return balances[msg.sender];
    }
}
