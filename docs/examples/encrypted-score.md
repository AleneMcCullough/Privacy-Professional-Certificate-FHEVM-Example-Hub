# Encrypted Score Management Example

## Overview

This example shows how to securely manage encrypted professional scores on-chain.

## Use Case

Professional platforms need to:
- Store encrypted performance scores
- Update scores while maintaining privacy
- Control score access
- Maintain audit trails

## Contract Structure

### State Variables

```solidity
mapping(address => euint64) private scores;
address public owner;
```

### Key Functions

#### setScore()

Set or update an encrypted score:

```solidity
function setScore(address user, euint64 encryptedScore) external
```

**Parameters**:
- user: User address
- encryptedScore: Encrypted score value

**Requirements**:
- Only owner can set scores
- Valid user address required

**Events**:
- Emits ScoreUpdated event

#### getScore()

Retrieve encrypted score:

```solidity
function getScore(address user) external view returns (euint64)
```

**Returns**: Encrypted score for the user

## Encryption Details

### Score Representation

Scores stored as euint64:
- 64-bit encrypted unsigned integer
- Supports scores up to 2^64
- Encrypted at rest in smart contract

### Access Control

Only owner can:
- Set or update scores
- Modify user scores
- Clear scores if needed

Users can:
- View their own encrypted score
- Trigger their score to be decrypted

## Security Considerations

1. **Owner Protection**: Only owner can update
2. **Data Privacy**: Scores encrypted in state
3. **Audit Trail**: Events log all updates
4. **Type Safety**: euint64 prevents overflows

## Testing

Tests verify:
- Score setting and retrieval
- Owner-only access
- Event emission
- Multiple user scores

Run with:

```bash
npm run test -- --grep "EncryptedScore"
```

## Usage Example

```solidity
// Deploy contract
EncryptedScore scoreManager = new EncryptedScore();

// Set encrypted score for user
scoreManager.setScore(userAddress, encryptedScore);

// Retrieve encrypted score
euint64 retrievedScore = scoreManager.getScore(userAddress);
```

## Real-World Applications

- Professional skill assessments
- Exam score management
- Performance evaluations
- Confidential rankings
- Privacy-preserving metrics

## Extension Possibilities

- Score history tracking
- Multiple score types
- Score aggregation
- Batch operations
- Score migration

## References

- See contracts/examples/EncryptedScore.sol
- See test/examples/EncryptedScore.test.ts
