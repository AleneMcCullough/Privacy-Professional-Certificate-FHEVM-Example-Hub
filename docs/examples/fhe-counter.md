# FHE Counter

## Overview

The FHE Counter demonstrates how to build a simple encrypted counter using FHEVM, showcasing the fundamental difference between a standard counter and one using fully homomorphic encryption.

## Concept

A simple counter increments and decrements a public value. An FHE counter keeps the count encrypted, maintaining privacy while still allowing operations.

## Key Features

- Encrypted counter value (euint32)
- Increment operation on encrypted data
- Decrement operation on encrypted data
- FHE.allowThis() for contract permissions
- FHE.allow() for user permissions

## Contract Structure

```solidity
contract FHECounter {
    euint32 private _count;
    
    function getCount() external view returns (euint32)
    function increment(euint32 value) external
    function decrement(euint32 value) external
}
```

## Usage

```bash
npm run create-example fhe-counter ./my-counter
cd my-counter
npm install
npm run test
```

## Test Cases

- Contract deployment
- Increment operation
- Decrement operation
- Event emission
- Access control

## Real-World Applications

- Privacy-preserving score tracking
- Confidential vote counting
- Hidden counter mechanisms
- Secure transaction tallying

## Learning Outcomes

Understand:
- Encrypted data types (euint32)
- FHE operations on encrypted values
- Permission management (allowThis, allow)
- Event logging for encrypted operations
