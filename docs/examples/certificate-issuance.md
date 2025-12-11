# Certificate Issuance Example

## Overview

This example demonstrates how to issue encrypted professional certificates on-chain.

## Use Case

A certification body needs to:
- Issue encrypted certificates
- Store encrypted scores and levels
- Verify certificate validity
- Control access to credentials

## Contract Structure

### State Variables

```solidity
struct Certificate {
    address holder;
    euint64 encryptedScore;
    euint8 encryptedLevel;
    uint256 issuanceDate;
    bool isValid;
}

mapping(address => Certificate) public certificates;
address public issuer;
```

### Key Functions

#### issueCertificate()

Issue a new encrypted certificate:

```solidity
function issueCertificate(
    address holder,
    euint64 encryptedScore,
    euint8 encryptedLevel
) external
```

**Parameters**:
- holder: Certificate recipient address
- encryptedScore: Encrypted performance score
- encryptedLevel: Encrypted qualification level

**Requirements**:
- Only issuer can call
- Valid holder address required

**Events**:
- Emits CertificateIssued event

#### isCertificateValid()

Check if certificate is valid:

```solidity
function isCertificateValid(address holder) external view returns (bool)
```

**Returns**: true if certificate is valid and active

## Security Features

1. **Issuer Authorization**: Only authorized entity can issue
2. **Encrypted Storage**: Scores stored encrypted (euint64, euint8)
3. **Immutable Timestamps**: Record when issued
4. **Validity Tracking**: Mark certificates as valid/invalid

## Testing

Run tests with:

```bash
npm run test -- --grep "CertificateIssuance"
```

Test coverage includes:
- Deployment verification
- Certificate issuance
- Access control checks
- Validity verification

## Usage Example

```solidity
// Deploy contract
CertificateIssuance cert = new CertificateIssuance();

// Issue certificate with encrypted score (850) and level (5)
cert.issueCertificate(holderAddress, encryptedScore, encryptedLevel);

// Check if certificate is valid
bool valid = cert.isCertificateValid(holderAddress);
```

## Real-World Application

This pattern is useful for:
- Professional certification systems
- Credential validation services
- Privacy-preserving qualification tracking
- Confidential performance assessments

## Extension Ideas

- Revocation mechanism
- Expiration dates
- Multi-issuer support
- Category-based certificates
- Score ranges and tiers

## References

- See contracts/examples/CertificateIssuance.sol
- See test/examples/CertificateIssuance.test.ts
