// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Comparison Operations
/// @dev Demonstrates FHE comparison operations (eq, lt, le, gt, ge)
contract ComparisonOperations is SepoliaConfig {
    
    event ComparisonPerformed(string operation, address indexed user);

    /// @dev Equal comparison on encrypted values
    function isEqual(euint64 a, euint64 b) external returns (ebool) {
        ebool result = FHE.eq(a, b);
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        emit ComparisonPerformed("equal", msg.sender);
        return result;
    }

    /// @dev Less than comparison
    function isLessThan(euint64 a, euint64 b) external returns (ebool) {
        ebool result = FHE.lt(a, b);
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        emit ComparisonPerformed("lessThan", msg.sender);
        return result;
    }

    /// @dev Less than or equal comparison
    function isLessThanOrEqual(euint64 a, euint64 b) external returns (ebool) {
        ebool result = FHE.le(a, b);
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        emit ComparisonPerformed("lessThanOrEqual", msg.sender);
        return result;
    }

    /// @dev Greater than comparison
    function isGreaterThan(euint64 a, euint64 b) external returns (ebool) {
        ebool result = FHE.gt(a, b);
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        emit ComparisonPerformed("greaterThan", msg.sender);
        return result;
    }

    /// @dev Greater than or equal comparison
    function isGreaterThanOrEqual(euint64 a, euint64 b) external returns (ebool) {
        ebool result = FHE.ge(a, b);
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        emit ComparisonPerformed("greaterThanOrEqual", msg.sender);
        return result;
    }
}
