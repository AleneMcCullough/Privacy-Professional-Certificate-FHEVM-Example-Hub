// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Arithmetic Operations
/// @dev Demonstrates FHE arithmetic operations (add, sub, mul)
contract ArithmeticOperations is SepoliaConfig {
    
    event OperationPerformed(string operation, address indexed user);

    /// @dev Add two encrypted values
    function add(euint64 a, euint64 b) external returns (euint64) {
        euint64 result = FHE.add(a, b);
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        emit OperationPerformed("add", msg.sender);
        return result;
    }

    /// @dev Subtract encrypted values
    function subtract(euint64 a, euint64 b) external returns (euint64) {
        euint64 result = FHE.sub(a, b);
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        emit OperationPerformed("subtract", msg.sender);
        return result;
    }

    /// @dev Multiply encrypted values
    function multiply(euint64 a, euint64 b) external returns (euint64) {
        euint64 result = FHE.mul(a, b);
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        emit OperationPerformed("multiply", msg.sender);
        return result;
    }

    /// @dev Divide encrypted value by plaintext
    function divideByPlaintext(euint64 encrypted, uint64 plaintext) 
        external returns (euint64) 
    {
        require(plaintext != 0, "Division by zero");
        euint64 result = FHE.div(encrypted, plaintext);
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        emit OperationPerformed("divide", msg.sender);
        return result;
    }
}
