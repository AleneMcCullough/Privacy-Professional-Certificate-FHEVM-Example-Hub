# Automation Scripts Guide

This directory contains TypeScript scripts for automating FHEVM example generation and documentation.

## Scripts Overview

### 1. create-fhevm-example.ts

Generate standalone example repositories.

**Usage**:
```bash
npm run create-example <example-name> [output-path]
```

**Available Examples**:
- `certificate-issuance` - Issue encrypted professional certificates
- `encrypted-score` - Manage and encrypt professional scores

**Example**:
```bash
npm run create-example certificate-issuance ./my-cert-system
cd my-cert-system
npm install
npm run test
```

**Generated Structure**:
```
output-path/
├── contracts/              - Contract files
├── test/                   - Test suite
├── scripts/                - Deployment scripts
├── hardhat.config.ts       - Configuration
├── package.json            - Dependencies
├── tsconfig.json           - TypeScript config
└── README.md               - Documentation
```

### 2. create-fhevm-category.ts

Generate category-based project collections.

**Usage**:
```bash
npm run create-category <category-name> [output-path]
```

**Available Categories**:
- `basic` - Basic FHEVM operations (certificate issuance, score management)
- `decryption` - Decryption patterns
- `access` - Access control examples

**Example**:
```bash
npm run create-category basic ./basic-examples
cd basic-examples
npm install
npm run test
```

### 3. generate-docs.ts

Auto-generate documentation from code.

**Usage**:
```bash
npm run generate-docs <example-name>
npm run generate-all-docs
```

**Single Example Documentation**:
```bash
npm run generate-docs certificate-issuance
```

**Generate All Documentation**:
```bash
npm run generate-all-docs
```

**Output**: Markdown files in `docs/` directory

## Script Development

### Adding a New Example

1. Define example in `create-fhevm-example.ts`:
```typescript
const EXAMPLES = {
  "your-example": {
    name: "your-example",
    title: "Your Example Title",
    description: "Description of what it demonstrates",
    category: "category",
    contractFile: "YourContract.sol",
    testFile: "YourContract.ts",
    tags: ["tag1", "tag2"],
  },
};
```

2. Implement contract generation in `generateContractCode()`
3. Implement test generation in `generateTestCode()`
4. Run: `npm run create-example your-example ./test-output`

### Adding a New Category

1. Define category in `create-fhevm-category.ts`:
```typescript
const CATEGORIES = {
  "your-category": {
    name: "your-category",
    title: "Your Category Title",
    description: "Category description",
    examples: ["example-1", "example-2"],
  },
};
```

2. Run: `npm run create-category your-category ./output`

### Adding Documentation Templates

1. Edit `generate-docs.ts`
2. Add example metadata:
```typescript
const EXAMPLES_METADATA = {
  "your-example": {
    chapter: "chapter-name",
    title: "Example Title",
    description: "What it demonstrates",
  },
};
```

3. Run: `npm run generate-docs your-example`

## Script Architecture

### Dependencies

- `fs-extra`: File system operations
- `path`: Path manipulation
- `typescript`: Type safety

### Pattern

All scripts follow this pattern:
1. Define examples/categories
2. Validate input
3. Create directory structure
4. Generate files
5. Report results

## Best Practices

1. **Always validate inputs** before file operations
2. **Create directory structure** before writing files
3. **Use consistent naming** conventions
4. **Include helpful error messages**
5. **Log progress** to console

## Troubleshooting

### Script fails to run

Check TypeScript installation:
```bash
npx tsc --version
```

### Output directory not created

Verify permissions:
```bash
ls -la parent-directory
```

### Generated files are incomplete

Check disk space:
```bash
df -h
```

## Examples of Generated Output

### Example Structure

```
certificate-issuance/
├── contracts/CertificateIssuance.sol
├── test/CertificateIssuance.ts
├── README.md
├── hardhat.config.ts
├── package.json
└── tsconfig.json
```

### Generated Contract Template

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, ... } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract CertificateIssuance is SepoliaConfig {
    // Implementation follows FHEVM patterns
}
```

### Generated Test Template

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("CertificateIssuance", function () {
  let contract: any;
  
  beforeEach(async function () {
    const Factory = await ethers.getContractFactory("CertificateIssuance");
    contract = await Factory.deploy();
  });
  
  it("Should test functionality", async function () {
    // Test implementation
  });
});
```

## Running Scripts Manually

Run TypeScript scripts directly:

```bash
ts-node scripts/create-fhevm-example.ts certificate-issuance ./output
```

Or use npm scripts (recommended):

```bash
npm run create-example certificate-issuance ./output
```

## Integration with CI/CD

Examples of using scripts in automation:

```bash
# Generate examples for testing
npm run create-example certificate-issuance ./ci-test-output
cd ./ci-test-output
npm install
npm run test

# Generate documentation
npm run generate-all-docs
```

For questions, refer to the main [README.md](../README.md).
