// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypt Single Value
/// @dev Demonstrates encrypting a single value with input proofs
contract EncryptSingleValue is SepoliaConfig {
    
    mapping(address => euint64) private userValues;
    
    event ValueEncrypted(address indexed user);

    /// @dev Store encrypted value with input proof
    /// @param inputEuint64 External encrypted input
    /// @param inputProof Zero-knowledge proof for the input
    function storeEncryptedValue(
        externalEuint64 inputEuint64,
        bytes calldata inputProof
    ) external {
        // Convert external encrypted input to internal encrypted value
        euint64 encryptedValue = FHE.fromExternal(inputEuint64, inputProof);
        
        // Store the encrypted value
        userValues[msg.sender] = encryptedValue;
        
        // Grant permissions
        FHE.allowThis(encryptedValue);
        FHE.allow(encryptedValue, msg.sender);
        
        emit ValueEncrypted(msg.sender);
    }

    /// @dev Retrieve encrypted value
    function getEncryptedValue() external view returns (euint64) {
        return userValues[msg.sender];
    }

    /// @dev Update encrypted value
    function updateEncryptedValue(
        externalEuint64 inputEuint64,
        bytes calldata inputProof
    ) external {
        euint64 newValue = FHE.fromExternal(inputEuint64, inputProof);
        userValues[msg.sender] = newValue;
        
        FHE.allowThis(newValue);
        FHE.allow(newValue, msg.sender);
        
        emit ValueEncrypted(msg.sender);
    }
}
