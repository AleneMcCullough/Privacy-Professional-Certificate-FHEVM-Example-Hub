# Installation and Setup Guide

## Prerequisites

Before you begin, ensure you have:
- Node.js 16.0 or higher
- npm 7.0 or higher
- Git
- A code editor (VS Code recommended)

## Installation Steps

### Step 1: Clone or Extract the Repository

```bash
cd /path/to/privacy-professional-certificate
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- hardhat
- @fhevm/solidity
- typescript
- ethers

### Step 3: Verify Installation

```bash
npm run compile
```

If successful, you'll see compiled artifacts in the `artifacts/` directory.

## Configuration

### Hardhat Configuration

The main configuration file is `hardhat.config.ts`. Default settings:
- Compiler: Solidity 0.8.24
- Optimization: Enabled (200 runs)
- Networks: hardhat, localhost, sepolia

### Network Configuration

For Sepolia testnet testing:

```bash
export PRIVATE_KEY=your_private_key
export SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

### TypeScript Configuration

TypeScript settings in `tsconfig.json` are configured for:
- ES2020 target
- CommonJS modules
- Strict type checking
- Source maps for debugging

## Verification

Run the test suite to verify everything is working:

```bash
npm run test
```

Expected output:
```
CertificateIssuance
  Deployment
    ✓ Should deploy successfully
    ✓ Should issue a certificate
  ...
EncryptedScore
  ...
  passing (X tests)
```

## Project Structure

After installation, your project should have:

```
privacy-professional-certificate/
├── contracts/              # Smart contracts
├── test/                   # Test files
├── scripts/                # Automation and deployment
├── artifacts/              # Compiled contract artifacts
├── docs/                   # Documentation
├── node_modules/           # Dependencies
├── hardhat.config.ts       # Hardhat configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project metadata
```

## Troubleshooting

### Issue: "Cannot find module '@fhevm/solidity'"

**Solution**: Ensure dependencies are installed:
```bash
npm install
```

### Issue: "Compilation failed"

**Solution**: Check Solidity version compatibility:
```bash
npm run compile --verbose
```

### Issue: Tests fail with "Unknown error"

**Solution**: Clear artifacts and rebuild:
```bash
rm -rf artifacts cache
npm run compile
npm run test
```

## Next Steps

1. Review the [Quick Start Guide](quickstart.md)
2. Explore [Examples](../contracts/examples/)
3. Run the [test suite](../test/)
4. Check the [documentation](../README.md)

## Getting Help

- Review the troubleshooting section below
- Check [FAQ](faq.md)
- Refer to official documentation links in [References](references.md)
