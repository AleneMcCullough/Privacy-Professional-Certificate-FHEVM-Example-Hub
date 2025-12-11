// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Anti-Patterns
/// @dev Demonstrates common mistakes and anti-patterns with FHEVM
/// @notice Learn what NOT to do when working with encrypted values
contract AntiPatterns is SepoliaConfig {
    
    euint64 private encryptedValue;

    /// ANTI-PATTERN 1: View functions with encrypted values
    /// @dev ❌ WRONG: Cannot use view functions to return encrypted types for decryption
    /// @notice View functions cannot trigger decryption or modify access control
    /// This will NOT allow users to decrypt the value
    function getValueWrong() external view returns (euint64) {
        // This does NOT grant decryption permissions!
        return encryptedValue;
    }

    /// ✅ CORRECT: Non-view function that grants access
    function getValueCorrect() external returns (euint64) {
        FHE.allow(encryptedValue, msg.sender);
        return encryptedValue;
    }

    /// ANTI-PATTERN 2: Missing FHE.allowThis() permissions
    /// @dev ❌ WRONG: Storing encrypted value without contract self-permission
    function storeValueWrong(
        externalEuint64 inputValue,
        bytes calldata inputProof
    ) external {
        euint64 value = FHE.fromExternal(inputValue, inputProof);
        encryptedValue = value;
        // Missing: FHE.allowThis(value)
        // Contract cannot perform operations on this value later!
    }

    /// ✅ CORRECT: Always use FHE.allowThis() for contract storage
    function storeValueCorrect(
        externalEuint64 inputValue,
        bytes calldata inputProof
    ) external {
        euint64 value = FHE.fromExternal(inputValue, inputProof);
        encryptedValue = value;
        
        FHE.allowThis(value); // ✅ Contract can use this value
        FHE.allow(value, msg.sender); // ✅ User can decrypt
    }

    /// ANTI-PATTERN 3: Comparing encrypted with plaintext incorrectly
    /// @dev ❌ WRONG: Cannot directly compare encrypted with plaintext
    // function compareWrong(euint64 encrypted) external view returns (bool) {
    //     return encrypted == 100; // ❌ This will NOT compile
    // }

    /// ✅ CORRECT: Use FHE comparison operations
    function compareCorrect(euint64 encrypted, uint64 threshold) 
        external view returns (bool) 
    {
        // Convert plaintext to encrypted, then compare
        euint64 encryptedThreshold = FHE.asEuint64(threshold);
        // This returns ebool, not bool
        // Use FHE.decrypt() with proper permissions for bool result
        return FHE.decrypt(FHE.gt(encrypted, encryptedThreshold));
    }

    /// ANTI-PATTERN 4: Not validating FHE initialization
    /// @dev ❌ WRONG: Operating on uninitialized encrypted values
    function operateWithoutCheckWrong(euint64 a, euint64 b) 
        external pure returns (euint64) 
    {
        // If a or b are uninitialized, this will fail
        return FHE.add(a, b);
    }

    /// ✅ CORRECT: Always check initialization
    function operateWithCheckCorrect(euint64 a, euint64 b) 
        external pure returns (euint64) 
    {
        require(FHE.isInitialized(a), "Value a not initialized");
        require(FHE.isInitialized(b), "Value b not initialized");
        return FHE.add(a, b);
    }

    /// ANTI-PATTERN 5: Exposing encrypted values in events
    /// @dev ❌ WRONG: Emitting encrypted values defeats purpose
    event ValueStoredWrong(euint64 value); // ❌ Don't emit encrypted values

    /// ✅ CORRECT: Emit only non-sensitive metadata
    event ValueStoredCorrect(address indexed user, uint256 timestamp);

    /// ANTI-PATTERN 6: Incorrect handle usage
    /// @dev Handles are internal representations and should not be exposed
    /// ❌ WRONG: Exposing or manipulating handles directly
    /// ✅ CORRECT: Always work with euint types, not handles
}
