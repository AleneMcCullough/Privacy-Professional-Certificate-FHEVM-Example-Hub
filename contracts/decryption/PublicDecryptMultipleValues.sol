// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, euint32, euint8, externalEuint64, externalEuint32, externalEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Public Decrypt Multiple Values
/// @dev Demonstrates public decryption of multiple encrypted values
contract PublicDecryptMultipleValues is SepoliaConfig {

    struct EncryptedData {
        euint64 score;
        euint32 level;
        euint8 category;
    }

    struct DecryptedData {
        uint64 score;
        uint32 level;
        uint8 category;
    }

    EncryptedData private encryptedData;
    DecryptedData public decryptedData;
    bool public isDecrypted;

    event DataStored(address indexed user);
    event DecryptionRequested(uint256 requestId);
    event DataDecrypted(uint64 score, uint32 level, uint8 category);

    /// @dev Store multiple encrypted values
    function storeData(
        externalEuint64 inputScore,
        bytes calldata scoreProof,
        externalEuint32 inputLevel,
        bytes calldata levelProof,
        externalEuint8 inputCategory,
        bytes calldata categoryProof
    ) external {
        euint64 encryptedScore = FHE.fromExternal(inputScore, scoreProof);
        euint32 encryptedLevel = FHE.fromExternal(inputLevel, levelProof);
        euint8 encryptedCategory = FHE.fromExternal(inputCategory, categoryProof);

        encryptedData = EncryptedData({
            score: encryptedScore,
            level: encryptedLevel,
            category: encryptedCategory
        });

        FHE.allowThis(encryptedScore);
        FHE.allowThis(encryptedLevel);
        FHE.allowThis(encryptedCategory);

        isDecrypted = false;
        emit DataStored(msg.sender);
    }

    /// @dev Request public decryption of all values
    function requestPublicDecryption() external returns (uint256) {
        require(FHE.isInitialized(encryptedData.score), "Data not initialized");

        // Create decryption request ID
        uint256 requestId = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            encryptedData.score
        )));

        emit DecryptionRequested(requestId);
        return requestId;
    }

    /// @dev Simulate KMS callback for decrypting all values
    /// @notice In production, only the KMS can call this
    function fulfillDecryption(
        uint64 plainScore,
        uint32 plainLevel,
        uint8 plainCategory
    ) external {
        decryptedData = DecryptedData({
            score: plainScore,
            level: plainLevel,
            category: plainCategory
        });

        isDecrypted = true;

        emit DataDecrypted(plainScore, plainLevel, plainCategory);
    }

    /// @dev Get encrypted data handles
    function getEncryptedData() external view returns (
        euint64 score,
        euint32 level,
        euint8 category
    ) {
        return (
            encryptedData.score,
            encryptedData.level,
            encryptedData.category
        );
    }

    /// @dev Get decrypted data (only available after decryption)
    function getDecryptedData() external view returns (
        uint64 score,
        uint32 level,
        uint8 category
    ) {
        require(isDecrypted, "Data not yet decrypted");
        return (
            decryptedData.score,
            decryptedData.level,
            decryptedData.category
        );
    }

    /// @dev Check if data has been decrypted
    function hasDecrypted() external view returns (bool) {
        return isDecrypted;
    }
}
