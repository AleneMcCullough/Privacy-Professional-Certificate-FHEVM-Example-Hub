# Adding New Examples

## Overview

This guide explains how to add new examples to the project.

## Step-by-Step Process

### Step 1: Plan Your Example

1. **Choose a concept** to demonstrate
2. **Define learning goals**
3. **Write example description**
4. **Identify test cases**

### Step 2: Create Contract

Create new contract in `contracts/examples/`:

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Your Example Title
/// @dev Your example description
contract YourExample is SepoliaConfig {
    
    event YourEvent(address indexed user, string message);
    
    // Implementation
}
```

### Step 3: Create Tests

Create test in `test/examples/YourExample.test.ts`:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("YourExample", function () {
  let contract: any;
  let owner: any;

  beforeEach(async function () {
    const Factory = await ethers.getContractFactory("YourExample");
    contract = await Factory.deploy();
    [owner] = await ethers.getSigners();
  });

  it("Should deploy successfully", async function () {
    expect(contract.address).to.not.be.undefined;
  });

  // Add more tests
});
```

### Step 4: Test Locally

```bash
npm run compile
npm run test
```

All tests must pass before proceeding.

### Step 5: Register Example

Edit `scripts/create-fhevm-example.ts`:

```typescript
const EXAMPLES = {
  "your-example-name": {
    name: "your-example-name",
    title: "Your Example Title",
    description: "Clear description of what it demonstrates",
    category: "category-name",
    contractFile: "YourExample.sol",
    testFile: "YourExample.test.ts",
    tags: ["tag1", "tag2"],
  },
  // ... existing examples
};
```

### Step 6: Create Documentation

Create `docs/examples/your-example.md`:

```markdown
# Your Example Title

## Overview
Description of the example.

## Use Case
What problem does it solve?

## Contract Structure
Explain the main components.

## Key Functions
Document important functions.

## Testing
How to test this example.

## Extension Ideas
Future improvements.
```

### Step 7: Update Metadata

Edit `scripts/generate-docs.ts`:

```typescript
const EXAMPLES_METADATA = {
  "your-example": {
    chapter: "category",
    title: "Your Example Title",
    description: "What it demonstrates",
  },
  // ... existing metadata
};
```

### Step 8: Test Automation

Test the generation script:

```bash
npm run create-example your-example ./test-output
cd test-output
npm install
npm run compile
npm run test
```

Should work without errors.

### Step 9: Code Review

Before submission:

1. **Code Quality**
   - Clear variable names
   - Comments for complex logic
   - Follows project conventions

2. **Security**
   - Input validation
   - Access control checks
   - Secure encryption patterns

3. **Testing**
   - 100% test coverage
   - Edge cases covered
   - Error cases tested

4. **Documentation**
   - Clear descriptions
   - Usage examples
   - Reference links

## Example Template

Here's a minimal example structure:

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Example Title
/// @dev Example description and purpose
contract ExampleName is SepoliaConfig {
    
    // State variables
    euint64 private encryptedData;
    address public owner;
    
    // Events
    event DataUpdated(address indexed user);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
    }
    
    // Functions
    function updateData(euint64 newData) external onlyOwner {
        encryptedData = newData;
        emit DataUpdated(msg.sender);
    }
    
    function getData() external view returns (euint64) {
        return encryptedData;
    }
}
```

## Best Practices

### 1. Follow Naming Conventions

- Contracts: PascalCase (MyContract)
- Functions: camelCase (myFunction)
- Constants: UPPER_CASE (MY_CONSTANT)
- Events: PascalCase (MyEvent)

### 2. Include Documentation

```solidity
/// @title What this does
/// @dev How it works
/// @param value What value means
/// @return What it returns
```

### 3. Add Comprehensive Tests

```typescript
// Test normal operation
it("Should work normally", ...);

// Test authorization
it("Only owner can call", ...);

// Test edge cases
it("Should handle boundary values", ...);

// Test failures
it("Should revert on invalid input", ...);
```

### 4. Security Considerations

Always include:
- Access control
- Input validation
- Safe arithmetic
- Event logging

### 5. Clear Comments

```solidity
// Explain WHY, not WHAT
// The code shows WHAT, comments explain WHY

// Good
require(msg.sender == owner, "Only owner can update"); // Enforce single update authority

// Bad
require(msg.sender == owner, "Check owner"); // Obvious from code
```

## Example Categories

### Basic
- Simple operations
- Encryption patterns
- Data storage

### Access Control
- Authorization patterns
- Permission management
- Restricted operations

### Advanced
- Complex interactions
- Multiple contract patterns
- Specialized use cases

## Testing Checklist

- [ ] Contract compiles without errors
- [ ] All tests pass
- [ ] Tests cover main functions
- [ ] Tests cover error cases
- [ ] Access control verified
- [ ] Events tested
- [ ] Documentation complete

## Documentation Checklist

- [ ] Clear title
- [ ] Use case explained
- [ ] Contract structure documented
- [ ] Functions documented
- [ ] Tests explained
- [ ] Extension ideas included
- [ ] Security notes added

## Submission Process

1. **Prepare files**
   - Contract in contracts/examples/
   - Tests in test/examples/
   - Documentation in docs/examples/

2. **Update scripts**
   - Add to EXAMPLES in create-fhevm-example.ts
   - Add metadata in generate-docs.ts

3. **Verify automation**
   - Test example generation
   - Verify documentation generation

4. **Final checks**
   - All tests pass
   - No compile errors
   - Documentation complete

5. **Submit**
   - Ready for integration

## Example Ideas

### Certificate Management
- Certificate renewal
- Certificate revocation
- Score migration

### Privacy Features
- Batch operations
- Score aggregation
- Comparative analysis

### Advanced Patterns
- Multi-party authorization
- Escrow patterns
- State machine patterns

## Questions?

Refer to:
- Existing examples in contracts/examples/
- Documentation in docs/
- FHEVM documentation
- Community resources

---

Thank you for contributing to the project!
