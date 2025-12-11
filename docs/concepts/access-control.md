# Access Control Patterns

## Overview

Access control ensures only authorized parties can perform certificate operations.

## Role-Based Access Control

### Issuer Role

Only authorized issuers can issue certificates:

```solidity
address public issuer;

modifier onlyIssuer() {
    require(msg.sender == issuer, "Only issuer");
    _;
}

function issueCertificate(address holder) external onlyIssuer {
    // Issue logic
}
```

### Holder Role

Certificate holders can view their own data:

```solidity
modifier onlyHolder(address holder) {
    require(msg.sender == holder, "Not authorized");
    _;
}

function viewMyScore() external onlyHolder(msg.sender) returns (euint64) {
    return scores[msg.sender];
}
```

## Authorization Patterns

### Direct Authorization

```solidity
function authorize(address user) external {
    require(msg.sender == owner, "Not owner");
    authorized[user] = true;
}
```

### Approval Pattern

```solidity
function approve(address user) external {
    require(msg.sender == owner, "Not owner");
    approvals[msg.sender][user] = true;
}
```

## FHE-Specific Access Control

### FHE.allow()

Grant decryption rights:

```solidity
function allowUserDecryption() external {
    FHE.allow(scores[msg.sender], msg.sender);
}
```

### FHE.allowThis()

Grant contract decryption rights:

```solidity
function processScore() external {
    euint64 score = scores[msg.sender];
    FHE.allowThis(score);
    // Process encrypted data
}
```

## Best Practices

1. **Always check permissions** before sensitive operations
2. **Use explicit checks**, not assumptions
3. **Log all permission changes** with events
4. **Validate inputs** before checking permissions
5. **Combine multiple checks** for sensitive operations

## Common Mistakes

- Forgetting to check msg.sender
- Assuming isContract means safe
- Not emitting events for authorization
- Missing boundary condition checks

## Implementation

See CertificateIssuance.sol for practical examples.
