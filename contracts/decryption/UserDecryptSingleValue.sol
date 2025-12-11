// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title User Decrypt Single Value
/// @dev Demonstrates user-initiated decryption of a single encrypted value
contract UserDecryptSingleValue is SepoliaConfig {
    
    mapping(address => euint64) private userScores;
    
    event ScoreStored(address indexed user);
    event DecryptionRequested(address indexed user);

    /// @dev Store encrypted score
    function storeScore(
        externalEuint64 inputScore,
        bytes calldata inputProof
    ) external {
        euint64 encryptedScore = FHE.fromExternal(inputScore, inputProof);
        userScores[msg.sender] = encryptedScore;
        
        FHE.allowThis(encryptedScore);
        FHE.allow(encryptedScore, msg.sender);
        
        emit ScoreStored(msg.sender);
    }

    /// @dev Request decryption of own score
    /// @notice User can decrypt their own encrypted score
    function requestDecryption() external returns (euint64) {
        euint64 score = userScores[msg.sender];
        require(FHE.isInitialized(score), "Score not initialized");
        
        // Allow user to decrypt their own score
        FHE.allow(score, msg.sender);
        
        emit DecryptionRequested(msg.sender);
        return score;
    }

    /// @dev Get encrypted score (no decryption permission)
    function getEncryptedScore() external view returns (euint64) {
        return userScores[msg.sender];
    }

    /// @dev Check if score is initialized
    function hasScore(address user) external view returns (bool) {
        return FHE.isInitialized(userScores[user]);
    }
}
