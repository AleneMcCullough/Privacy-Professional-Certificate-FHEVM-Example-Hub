# FHEVM Hardhat Template

A simple template for FHEVM smart contract development using Hardhat.

## Quick Start

### Installation

```bash
npm install
```

### Compile

```bash
npm run compile
```

### Test

```bash
npm run test
```

### Deploy

Local:
```bash
npm run deploy
```

Sepolia:
```bash
npm run deploy:sepolia
```

## Project Structure

```
├── contracts/           # Solidity contracts
├── test/               # Test files
├── scripts/            # Deployment scripts
├── hardhat.config.js   # Hardhat configuration
└── package.json        # Dependencies
```

## Configuration

Update `hardhat.config.js` with:
- Network settings
- Solidity version
- Compiler options

## Dependencies

- @fhevm/solidity - FHEVM encryption library
- hardhat - Development environment
- @nomicfoundation/hardhat-toolbox - Hardhat tools

## Environment Variables

Create `.env` file:

```
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_private_key
```

## Learn More

- [FHEVM Docs](https://docs.zama.ai/fhevm)
- [Hardhat Docs](https://hardhat.org)
