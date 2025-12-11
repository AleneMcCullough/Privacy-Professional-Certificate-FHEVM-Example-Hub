// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Access Control Example
/// @dev Demonstrates FHE.allow and FHE.allowTransient for access control
contract AccessControlExample is SepoliaConfig {
    
    mapping(address => euint64) private scores;
    address public admin;
    
    event ScoreStored(address indexed user);
    event AccessGranted(address indexed user, address indexed grantee, bool transient);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    /// @dev Store encrypted score with FHE.allow
    /// @notice Demonstrates persistent access control
    function storeScore(
        externalEuint64 inputScore,
        bytes calldata inputProof
    ) external {
        euint64 encryptedScore = FHE.fromExternal(inputScore, inputProof);
        scores[msg.sender] = encryptedScore;
        
        // Persistent access: FHE.allow
        FHE.allowThis(encryptedScore);
        FHE.allow(encryptedScore, msg.sender);
        
        emit ScoreStored(msg.sender);
    }

    /// @dev Grant persistent access to another address
    /// @param grantee Address to grant access
    function grantAccess(address grantee) external {
        euint64 score = scores[msg.sender];
        require(FHE.isInitialized(score), "Score not initialized");
        
        // Permanent access grant
        FHE.allow(score, grantee);
        
        emit AccessGranted(msg.sender, grantee, false);
    }

    /// @dev Grant transient access for one-time use
    /// @param grantee Address to grant temporary access
    /// @notice FHE.allowTransient provides temporary access that expires after use
    function grantTransientAccess(address grantee) external {
        euint64 score = scores[msg.sender];
        require(FHE.isInitialized(score), "Score not initialized");
        
        // Temporary access grant
        FHE.allowTransient(score, grantee);
        
        emit AccessGranted(msg.sender, grantee, true);
    }

    /// @dev View score with granted access
    function viewScore(address user) external view returns (euint64) {
        return scores[user];
    }

    /// @dev Admin can view any score
    function adminViewScore(address user) external view onlyAdmin returns (euint64) {
        euint64 score = scores[user];
        require(FHE.isInitialized(score), "Score not initialized");
        return score;
    }
}
