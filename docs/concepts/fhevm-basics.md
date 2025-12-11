# FHEVM Basics

## What is FHEVM?

FHEVM is technology that enables smart contracts to process encrypted data without decryption.

## Key Concepts

### Encryption Types

- euint8: 8-bit encrypted integer
- euint16: 16-bit encrypted integer
- euint32: 32-bit encrypted integer
- euint64: 64-bit encrypted integer

### Data Encryption

Professional credentials require protection:
- Test scores
- Qualification levels
- Performance metrics

### Computation on Encrypted Data

Operations on encrypted data:
- Add, subtract operations
- Comparison operations
- Logical operations
- All without decryption

## Example Usage

```solidity
import { FHE, euint64 } from "@fhevm/solidity/lib/FHE.sol";

contract EncryptedCertificate {
    euint64 private score;
    
    function setScore(euint64 encScore) external {
        score = encScore;
    }
}
```

## Privacy Benefits

1. Data Confidentiality: Information stays encrypted
2. Smart Processing: Work with encrypted data
3. On-Chain Privacy: No public exposure
4. User Control: Only authorized decryption

## Use Cases

- Encrypted professional certificates
- Private credential verification
- Confidential score storage
- Secure credential issuance

## Reference

- FHEVM Documentation
- Solidity Integration Guides
