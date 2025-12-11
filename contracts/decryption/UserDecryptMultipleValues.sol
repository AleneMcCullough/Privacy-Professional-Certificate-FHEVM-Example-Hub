// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, euint32, externalEuint64, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title User Decrypt Multiple Values
/// @dev Demonstrates user-initiated decryption of multiple encrypted values
contract UserDecryptMultipleValues is SepoliaConfig {
    
    struct UserData {
        euint64 score;
        euint32 achievements;
    }
    
    mapping(address => UserData) private userData;
    
    event DataStored(address indexed user);
    event MultipleDecryptionsRequested(address indexed user);

    /// @dev Store multiple encrypted values
    function storeData(
        externalEuint64 inputScore,
        bytes calldata scoreProof,
        externalEuint32 inputAchievements,
        bytes calldata achievementsProof
    ) external {
        euint64 encryptedScore = FHE.fromExternal(inputScore, scoreProof);
        euint32 encryptedAchievements = FHE.fromExternal(inputAchievements, achievementsProof);
        
        userData[msg.sender] = UserData({
            score: encryptedScore,
            achievements: encryptedAchievements
        });
        
        FHE.allowThis(encryptedScore);
        FHE.allow(encryptedScore, msg.sender);
        
        FHE.allowThis(encryptedAchievements);
        FHE.allow(encryptedAchievements, msg.sender);
        
        emit DataStored(msg.sender);
    }

    /// @dev Request decryption of all user data
    function requestDecryptionAll() external returns (euint64, euint32) {
        UserData memory data = userData[msg.sender];
        
        require(FHE.isInitialized(data.score), "Score not initialized");
        require(FHE.isInitialized(data.achievements), "Achievements not initialized");
        
        // Allow user to decrypt both values
        FHE.allow(data.score, msg.sender);
        FHE.allow(data.achievements, msg.sender);
        
        emit MultipleDecryptionsRequested(msg.sender);
        return (data.score, data.achievements);
    }

    /// @dev Request decryption of score only
    function requestDecryptScore() external returns (euint64) {
        euint64 score = userData[msg.sender].score;
        require(FHE.isInitialized(score), "Score not initialized");
        
        FHE.allow(score, msg.sender);
        return score;
    }

    /// @dev Request decryption of achievements only
    function requestDecryptAchievements() external returns (euint32) {
        euint32 achievements = userData[msg.sender].achievements;
        require(FHE.isInitialized(achievements), "Achievements not initialized");
        
        FHE.allow(achievements, msg.sender);
        return achievements;
    }
}
