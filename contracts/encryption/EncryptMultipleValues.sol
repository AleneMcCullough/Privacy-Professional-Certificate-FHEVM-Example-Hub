// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, euint32, euint8, externalEuint64, externalEuint32, externalEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypt Multiple Values
/// @dev Demonstrates encrypting multiple values of different types
contract EncryptMultipleValues is SepoliaConfig {
    
    struct EncryptedData {
        euint64 score;
        euint32 level;
        euint8 category;
    }
    
    mapping(address => EncryptedData) private userData;
    
    event MultipleValuesEncrypted(address indexed user);

    /// @dev Store multiple encrypted values with input proofs
    function storeMultipleValues(
        externalEuint64 inputScore,
        bytes calldata scoreProof,
        externalEuint32 inputLevel,
        bytes calldata levelProof,
        externalEuint8 inputCategory,
        bytes calldata categoryProof
    ) external {
        // Convert external encrypted inputs to internal encrypted values
        euint64 encryptedScore = FHE.fromExternal(inputScore, scoreProof);
        euint32 encryptedLevel = FHE.fromExternal(inputLevel, levelProof);
        euint8 encryptedCategory = FHE.fromExternal(inputCategory, categoryProof);
        
        // Store the encrypted values
        userData[msg.sender] = EncryptedData({
            score: encryptedScore,
            level: encryptedLevel,
            category: encryptedCategory
        });
        
        // Grant permissions for all values
        FHE.allowThis(encryptedScore);
        FHE.allow(encryptedScore, msg.sender);
        
        FHE.allowThis(encryptedLevel);
        FHE.allow(encryptedLevel, msg.sender);
        
        FHE.allowThis(encryptedCategory);
        FHE.allow(encryptedCategory, msg.sender);
        
        emit MultipleValuesEncrypted(msg.sender);
    }

    /// @dev Retrieve encrypted score
    function getEncryptedScore() external view returns (euint64) {
        return userData[msg.sender].score;
    }

    /// @dev Retrieve encrypted level
    function getEncryptedLevel() external view returns (euint32) {
        return userData[msg.sender].level;
    }

    /// @dev Retrieve encrypted category
    function getEncryptedCategory() external view returns (euint8) {
        return userData[msg.sender].category;
    }

    /// @dev Retrieve all encrypted data
    function getAllEncryptedData() external view returns (
        euint64 score,
        euint32 level,
        euint8 category
    ) {
        EncryptedData memory data = userData[msg.sender];
        return (data.score, data.level, data.category);
    }
}
