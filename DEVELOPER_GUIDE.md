# FHEVM Example Hub - Developer Guide

This guide explains how to add new examples and maintain this project.

## Project Structure

```
PrivacyProfessionalCertificate/
├── contracts/              # All Solidity smart contracts
│   ├── basic/             # Basic FHE examples
│   ├── encryption/        # Encryption examples
│   ├── decryption/        # Decryption examples
│   ├── access/            # Access control examples
│   ├── advanced/          # Advanced patterns
│   └── openzeppelin/      # OpenZeppelin confidential contracts
├── test/                  # Test files (mirroring contract structure)
├── scripts/               # Automation scripts
│   ├── create-fhevm-example.ts      # Generate standalone examples
│   ├── create-fhevm-category.ts     # Generate category projects
│   └── generate-docs.ts             # Generate documentation
├── docs/                  # Generated documentation
└── fhevm-hardhat-template/  # Base template for new repos
```

## Adding a New Example

### Step 1: Create the Solidity Contract

Create a new contract file in the appropriate `contracts/` subdirectory:

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Your Example Title
/// @dev Description of what this example demonstrates
contract YourExampleContract is SepoliaConfig {
    // Your implementation
}
```

**Best Practices:**
- Use clear, descriptive names for contracts and functions
- Include JSDoc/TSDoc comments on public functions
- Document the chapter/category with `@chapter` tag in comments
- Follow the existing code style
- Include event emissions for important operations
- Implement proper error handling with `require` statements

### Step 2: Create Comprehensive Tests

Create corresponding test file in `test/` with the same directory structure:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * Test suite for YourExampleContract
 *
 * @chapter your-category
 * @description What this example demonstrates
 */
describe("YourExampleContract", function () {
  let contract: any;
  let owner: any;

  beforeEach(async function () {
    const Factory = await ethers.getContractFactory("YourExampleContract");
    contract = await Factory.deploy();
    [owner] = await ethers.getSigners();
  });

  // Your test cases
});
```

**Testing Checklist:**
- Test basic functionality
- Test edge cases
- Test error conditions
- Include descriptive test names
- Add tests that demonstrate key concepts
- Show anti-patterns and best practices
- Test access control and permissions

### Step 3: Update Automation Scripts

Add your example to `scripts/create-fhevm-example.ts`:

```typescript
'your-example-name': {
  contract: 'contracts/your-category/YourExampleContract.sol',
  test: 'test/your-category/YourExampleContract.test.ts',
  description: 'Clear description of what this example demonstrates',
  category: 'your-category',
},
```

Add metadata to `scripts/generate-docs.ts`:

```typescript
'your-example-name': {
  chapter: 'your-category',
  title: 'Your Example Title',
  description: 'What this example demonstrates',
  category: 'Example Category',
  keyFeatures: [
    'Feature 1',
    'Feature 2',
  ],
},
```

### Step 4: Document Your Example

Generate documentation automatically:

```bash
npm run generate-docs your-example-name
```

Or generate documentation for all examples:

```bash
npm run generate-all-docs
```

## Creating Standalone Examples

To create a standalone repository from your example:

```bash
npm run create-example your-example-name ./output/your-example
cd ./output/your-example
npm install
npm run test
```

## Creating Category Projects

To create a collection of related examples:

```bash
npm run create-category basic ./output/fhevm-basic-examples
cd ./output/fhevm-basic-examples
npm install
npm run test:all
```

## Example Categories

### Basic Examples
- Simple FHE operations
- Counter, arithmetic, comparison
- Fundamental concepts

### Encryption Examples
- Single and multiple value encryption
- Input proof validation
- Type handling

### Decryption Examples
- User-controlled decryption
- Public decryption mechanism
- Permission management

### Access Control Examples
- FHE.allow() and FHE.allowTransient()
- Input proof explanation
- Anti-patterns to avoid

### Advanced Examples
- Complex patterns (blind auction)
- Multi-step operations
- Real-world use cases

### OpenZeppelin Examples
- ERC7984 confidential tokens
- Token wrappers
- Vesting mechanisms

## Writing Effective Tests

### Test Structure

```typescript
describe("Feature Name", function () {
  it("Should do something specific", async function () {
    // Arrange
    const mockValue = 1000n;
    const mockProof = "0x";

    // Act
    await contract.functionName(mockValue, mockProof);

    // Assert
    expect(result).to.not.be.undefined;
  });
});
```

### Test Naming Conventions

- **Functionality tests**: "Should [action] [condition]"
- **Error tests**: "Should revert [operation] [reason]"
- **Pattern tests**: "Demonstrates [pattern/concept]"
- **Edge case tests**: "[Specific scenario] handling"

### Common Assertions

```typescript
// Existence checks
expect(result).to.not.be.undefined;

// Type checks
expect(typeof value).to.equal("object");

// Event verification
expect(tx).to.emit(contract, "EventName");

// Error verification
expect(tx).to.be.revertedWith("Error message");

// Comparison (for encrypted values)
expect(encrypted1).to.not.deep.equal(encrypted2);
```

## Documentation Standards

### Code Comments

```solidity
/// @title Contract Purpose
/// @dev Implementation details
/// @notice User-facing description
function functionName(
    externalEuint64 encryptedValue,  // @param description
    bytes calldata proof             // @param description
) external {
    // Implementation
}
```

### README Generation

Each example automatically gets a README with:
- Overview and description
- Quick start instructions
- Contract and test locations
- Key concepts covered
- Testing instructions
- Deployment guides
- Further reading links

## Best Practices

### Security

- Always validate input proofs
- Check initialization with `FHE.isInitialized()`
- Grant proper permissions with `FHE.allowThis()` and `FHE.allow()`
- Never expose encrypted values in events
- Implement proper access control

### Code Quality

- Use meaningful variable names
- Keep functions focused and small
- Comment complex logic
- Handle all error cases
- Follow existing code style
- Test edge cases thoroughly

### Documentation

- Document the chapter/category
- Explain key concepts
- Show both correct and incorrect patterns
- Include real-world use cases
- Provide clear examples
- Link to relevant resources

### Testing

- Test happy paths
- Test error conditions
- Test edge cases
- Test permissions and access control
- Show educational value
- Include performance considerations

## Updating Examples for New FHEVM Versions

When FHEVM updates:

1. Update imports if needed
2. Check if function signatures changed
3. Update tests for any API changes
4. Test with new version
5. Update documentation
6. Add migration notes if breaking

## Running Tests

### Single Test Suite
```bash
npx hardhat test test/your-category/YourExample.test.ts
```

### All Tests
```bash
npm run test
```

### Specific Test
```bash
npx hardhat test test/your-category/YourExample.test.ts --grep "specific test name"
```

### With Coverage
```bash
npx hardhat coverage
```

## Deployment

### Local Network
```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

### Sepolia Testnet
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## Contributing Examples

1. Create contract and tests
2. Follow code standards
3. Add documentation
4. Update automation scripts
5. Test thoroughly
6. Verify with local builds
7. Document any special considerations

## Common Patterns

### Simple Contract Pattern
```solidity
contract SimpleExample is SepoliaConfig {
    euint64 private value;

    function store(externalEuint64 inputValue, bytes calldata proof) external {
        euint64 encrypted = FHE.fromExternal(inputValue, proof);
        value = encrypted;

        FHE.allowThis(encrypted);
        FHE.allow(encrypted, msg.sender);
    }

    function retrieve() external view returns (euint64) {
        return value;
    }
}
```

### Advanced Pattern (Multiple Values, Structs)
```solidity
contract AdvancedExample is SepoliaConfig {
    struct EncryptedData {
        euint64 value1;
        euint32 value2;
    }

    mapping(address => EncryptedData) private data;

    function store(
        externalEuint64 input1,
        bytes calldata proof1,
        externalEuint32 input2,
        bytes calldata proof2
    ) external {
        euint64 enc1 = FHE.fromExternal(input1, proof1);
        euint32 enc2 = FHE.fromExternal(input2, proof2);

        data[msg.sender] = EncryptedData(enc1, enc2);

        // Grant permissions for both
        FHE.allowThis(enc1);
        FHE.allow(enc1, msg.sender);

        FHE.allowThis(enc2);
        FHE.allow(enc2, msg.sender);
    }
}
```

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Chai Assertion Library](https://www.chaijs.com/api/)

## Support

For questions or issues:
- Check existing examples for patterns
- Review the documentation
- Consult FHEVM docs
- Check test cases for usage examples

---

**Last Updated**: December 2025
