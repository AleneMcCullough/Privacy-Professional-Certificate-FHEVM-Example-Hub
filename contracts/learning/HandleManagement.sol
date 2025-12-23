// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, externalEuint32, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Handle Management Example
/// @dev Educational contract demonstrating proper handle usage patterns
/// @notice Shows how handles work internally and best practices for handle management
contract HandleManagement is SepoliaConfig {

    // Demonstrates handle storage
    mapping(address => euint64) private userHandles;

    event HandleCreated(address indexed user);
    event HandleUpdated(address indexed user);
    event HandleUsed(address indexed user);

    /// @dev Creating a handle via FHE.fromExternal
    function createHandle(
        externalEuint64 externalValue,
        bytes calldata proof
    ) external {
        // FHE.fromExternal creates a new handle for this encrypted value
        euint64 handle = FHE.fromExternal(externalValue, proof);

        // Store the handle in contract state
        userHandles[msg.sender] = handle;

        // Grant permissions for this handle
        FHE.allowThis(handle);
        FHE.allow(handle, msg.sender);

        emit HandleCreated(msg.sender);
    }

    /// @dev Demonstrates handle composition through operations
    function operateOnHandle(
        externalEuint64 additionalValue,
        bytes calldata proof
    ) external {
        euint64 currentHandle = userHandles[msg.sender];
        require(FHE.isInitialized(currentHandle), "No handle for user");

        euint64 additionalHandle = FHE.fromExternal(additionalValue, proof);

        // Operating on handles creates NEW handles
        euint64 resultHandle = FHE.add(currentHandle, additionalHandle);

        // Update stored handle with new one
        userHandles[msg.sender] = resultHandle;

        FHE.allowThis(resultHandle);
        FHE.allow(resultHandle, msg.sender);

        emit HandleUpdated(msg.sender);
    }

    /// @dev Retrieving a handle (encrypted value)
    function getHandle() external view returns (euint64) {
        euint64 handle = userHandles[msg.sender];
        require(FHE.isInitialized(handle), "No handle for user");

        // Grant permission to allow retrieval
        FHE.allow(handle, msg.sender);

        return handle;  // Returns handle, not plaintext
    }

    /// @dev Demonstrates multiple handles for one user
    function createMultipleHandles(
        externalEuint32 value1,
        bytes calldata proof1,
        externalEuint32 value2,
        bytes calldata proof2
    ) external {
        // Each FHE.fromExternal creates a NEW handle
        euint32 handle1 = FHE.fromExternal(value1, proof1);
        euint32 handle2 = FHE.fromExternal(value2, proof2);

        // Each handle is independent
        FHE.allowThis(handle1);
        FHE.allow(handle1, msg.sender);

        FHE.allowThis(handle2);
        FHE.allow(handle2, msg.sender);

        // Handles are not comparable with operators
        // You cannot do: if (handle1 == handle2) { ... }
        // Handles are opaque - you must decrypt to compare
    }

    /// @dev Demonstrating symbolic execution with handles
    function conditionalOperationWithHandles(
        externalEuint64 compareValue,
        bytes calldata proof
    ) external {
        euint64 currentHandle = userHandles[msg.sender];
        require(FHE.isInitialized(currentHandle), "No handle for user");

        euint64 compareHandle = FHE.fromExternal(compareValue, proof);

        // Symbolic execution: comparison without decryption
        // Returns encrypted boolean handle
        // ebool is also a handle!
        // ebool comparisonHandle = FHE.gt(currentHandle, compareHandle);

        // Symbolic conditional: select handle based on encrypted condition
        // euint64 resultHandle = FHE.cmux(
        //     comparisonHandle,
        //     currentHandle,      // If true: this handle
        //     compareHandle       // If false: that handle
        // );

        // Result is a NEW handle representing the selected value
        // The actual comparison and selection happen in encrypted domain
    }

    /// @dev Shows handle persistence across transactions
    function updateHandleMultipleTimes(
        externalEuint64 value1,
        bytes calldata proof1,
        externalEuint64 value2,
        bytes calldata proof2
    ) external {
        // Transaction 1: Create initial handle
        euint64 handle = FHE.fromExternal(value1, proof1);
        userHandles[msg.sender] = handle;

        FHE.allowThis(handle);
        FHE.allow(handle, msg.sender);

        // Transaction 2 (separate call): Update with new handle
        // userHandles[msg.sender] is still the old handle
        handle = userHandles[msg.sender];  // Retrieve old handle

        euint64 newValue = FHE.fromExternal(value2, proof2);

        // Create new handle from operation
        euint64 updatedHandle = FHE.add(handle, newValue);

        // Store new handle (replaces old one)
        userHandles[msg.sender] = updatedHandle;

        FHE.allowThis(updatedHandle);
        FHE.allow(updatedHandle, msg.sender);
    }

    /// @dev Demonstrates handle lifecycle
    function demonstrateHandleLifecycle(
        externalEuint64 initialValue,
        bytes calldata proof
    ) external {
        // Phase 1: CREATION
        // Handle created when FHE.fromExternal is called
        euint64 handle = FHE.fromExternal(initialValue, proof);

        // Phase 2: STORAGE
        // Handle stored in state - persists across transactions
        userHandles[msg.sender] = handle;

        // Phase 3: OPERATIONS
        // Handle can be used in operations to create new handles
        // (In actual call, this would be in separate transaction)

        // Phase 4: PERMISSIONS
        // Grant permissions for decryption
        FHE.allowThis(handle);
        FHE.allow(handle, msg.sender);

        // Phase 5: RETRIEVAL
        // Handle can be retrieved for use in client
        euint64 retrievedHandle = userHandles[msg.sender];

        // Phase 6: DELETION (implicit)
        // Handle deleted when state variable is deleted or reassigned
        emit HandleUsed(msg.sender);
    }

    /// @dev Shows that handles are unique even for same plaintext
    function demonstrateHandleUniqueness(
        externalEuint32 value,
        bytes calldata proof1,
        bytes calldata proof2  // Same plaintext, different proof context
    ) external {
        // Create two handles from same plaintext value
        euint32 handle1 = FHE.fromExternal(value, proof1);
        euint32 handle2 = FHE.fromExternal(value, proof2);

        // handle1 and handle2 are DIFFERENT handles
        // Even though they represent the same plaintext value
        // They have different internal ciphertexts

        // You CANNOT do: if (handle1 == handle2) { ... }
        // Handles are opaque and not directly comparable

        // To compare, you must decrypt both values
        // Or use FHE operations for homomorphic comparison

        FHE.allowThis(handle1);
        FHE.allow(handle1, msg.sender);

        FHE.allowThis(handle2);
        FHE.allow(handle2, msg.sender);
    }

    /// @dev Anti-pattern: Don't try to access handle internals
    // WRONG: This would not compile
    // function wrongHandleAccess() external {
    //     euint64 handle = userHandles[msg.sender];
    //     uint256 handleValue = handle._euint64;  // ❌ Not allowed
    //     if (handleValue == 0) { ... }          // ❌ Type mismatch
    // }

    /// @dev Anti-pattern: Don't expose handles in events
    // WRONG: This defeats privacy
    // event WrongHandleExposed(euint64 encryptedValue);  // ❌ Bad
    // Better: Emit metadata only
    event ProperEventEmission(address indexed user, uint256 timestamp);

    /// @dev Correct pattern: Use FHE operations for all encrypted comparisons
    function correctHandleComparison(
        externalEuint64 threshold,
        bytes calldata proof
    ) external {
        euint64 userValue = userHandles[msg.sender];
        require(FHE.isInitialized(userValue), "No value");

        euint64 thresholdValue = FHE.fromExternal(threshold, proof);

        // CORRECT: Use FHE.gt to compare handles (homomorphically)
        // ebool result = FHE.gt(userValue, thresholdValue);
        // This compares encrypted values without decryption

        // WRONG: Cannot do comparison with operator
        // if (userValue > thresholdValue) { ... }  // ❌ Type error

        // WRONG: Cannot test for equality
        // if (userValue == thresholdValue) { ... }  // ❌ Type error
    }

    /// @dev Handle summary and key points
    // KEY POINTS ABOUT HANDLES:
    // 1. Handles are created by FHE.fromExternal and FHE operations
    // 2. Each handle is unique, even for same plaintext
    // 3. Handles can be stored in state and used across transactions
    // 4. Operations on handles create NEW handles
    // 5. Handles can be used with FHE operations (add, sub, mul, gt, etc.)
    // 6. Handles cannot be directly compared with operators
    // 7. Handles must have permissions granted (FHE.allow)
    // 8. Handles are abstract - never try to access internals
    // 9. Symbolic execution uses handles for encrypted conditionals
    // 10. KMS manages actual ciphertexts referenced by handles
}
