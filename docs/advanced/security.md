# Security Best Practices

## Overview

Security is critical for certificate management systems handling sensitive credentials.

## Smart Contract Security

### Access Control

**Always check permissions**:

```solidity
modifier onlyAuthorized() {
    require(msg.sender == authorized, "Not authorized");
    _;
}
```

**Use explicit checks**:

```solidity
function sensitiveOperation() external {
    require(msg.sender == issuer, "Only issuer can call");
    // Operation
}
```

**Validate inputs**:

```solidity
function setScore(address user, euint64 score) external {
    require(user != address(0), "Invalid address");
    scores[user] = score;
}
```

### Encryption Safety

**Use correct types**:
- euint8 for small values
- euint64 for large values
- Never cast encrypted types

**Protect encrypted data**:

```solidity
mapping(address => euint64) private scores; // Use private
```

**Implement FHE permissions**:

```solidity
function decryptScore() external {
    FHE.allow(scores[msg.sender], msg.sender);
    // Allow decryption
}
```

### Common Vulnerabilities

#### Reentrancy

```solidity
// VULNERABLE
function withdraw() external {
    msg.sender.call{value: balance[msg.sender]}("");
    balance[msg.sender] = 0;
}

// SAFE
function withdraw() external {
    uint256 amount = balance[msg.sender];
    balance[msg.sender] = 0;
    msg.sender.call{value: amount}("");
}
```

#### Integer Overflow

Use uint64 to prevent large numbers:

```solidity
euint64 score; // Prevents overflow
```

#### Unvalidated External Calls

```solidity
// VULNERABLE
externalContract.transfer(amount);

// SAFE
require(externalContract.transfer(amount), "Transfer failed");
```

## Private Key Management

### Environment Variables

**Store securely**:

```bash
# .env (never commit)
PRIVATE_KEY=your_key_here
```

**Use environment in code**:

```javascript
const privateKey = process.env.PRIVATE_KEY;
```

**Rotate keys regularly**:
- Use different keys for different networks
- Never reuse keys across systems
- Rotate after staff changes

### Key Storage

**Development**:
- Use test accounts with no real funds
- Store in local .env (git-ignored)

**Production**:
- Use hardware wallets
- Use key management services
- Never hardcode keys

## Contract Verification

### Code Review Checklist

- [ ] All inputs validated
- [ ] All access control in place
- [ ] No integer overflows possible
- [ ] Events logged for important operations
- [ ] Error messages descriptive
- [ ] Comments explain complex logic

### Testing Security

Run comprehensive tests:

```bash
npm run test
```

Test coverage should include:
- Normal operation
- Authorization failures
- Invalid inputs
- Boundary conditions
- Exceptional cases

### Formal Verification

Consider formal verification for:
- Critical functions
- Financial operations
- Access control logic

## Data Privacy

### Encrypted Storage

All sensitive data encrypted:

```solidity
euint64 private scores; // Encrypted scores
euint8 private levels;  // Encrypted levels
```

### Access Logging

Log all access attempts:

```solidity
event AccessLog(address indexed user, string action);
```

### Audit Trail

Maintain complete history:

```solidity
event CertificateIssued(
    uint256 indexed certificateId,
    address indexed holder,
    uint256 timestamp
);
```

## Network Security

### Use HTTPS

All connections should use HTTPS:

```javascript
const RPC_URL = "https://rpc.sepolia.org";
```

### Validate RPC Endpoints

- Use trusted providers
- Monitor for changes
- Have backup providers

### Rate Limiting

If applicable:
- Limit transactions per address
- Monitor for attack patterns
- Implement timeouts

## Incident Response

### Security Issues

If vulnerability discovered:

1. **Stop operation**: Disable affected functions
2. **Assess impact**: Determine what was compromised
3. **Notify users**: Inform stakeholders
4. **Fix issue**: Implement solution
5. **Deploy fix**: Redeploy contracts
6. **Monitor**: Watch for exploitation

### Emergency Procedures

```solidity
bool public paused = false;

modifier whenNotPaused() {
    require(!paused, "Contract paused");
    _;
}

function pause() external onlyOwner {
    paused = true;
}
```

## Security Audit

### Before Mainnet

Conduct security audit:
- Internal review
- External audit if budget allows
- Penetration testing
- Code analysis tools

### Ongoing Monitoring

- Watch for exploit attempts
- Monitor contract activity
- Track transaction patterns
- Alert on suspicious behavior

## Compliance

### Legal Considerations

- Data protection regulations (GDPR, etc.)
- User consent requirements
- Privacy policy requirements
- Terms of service clarity

### Documentation

Document:
- Security measures
- Privacy practices
- Incident procedures
- Recovery procedures

## Resources

- OpenZeppelin Security Guidelines
- Solidity Security Considerations
- FHEVM Security Documentation
- Smart Contract Audit Checklist

## Support

Report security issues to:
- Development team
- Not public issue trackers
- Responsible disclosure channels
