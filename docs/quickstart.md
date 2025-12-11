# Quick Start Guide

Get up and running with Privacy Professional Certificates in 5 minutes.

## Installation

```bash
npm install
npm run compile
```

## Run Tests

```bash
npm run test
```

## Generate an Example

Create a new standalone example repository:

```bash
npm run create-example certificate-issuance ./my-example
cd my-example
npm install
npm run compile
npm run test
```

## Common Tasks

### Compile Contracts

```bash
npm run compile
```

Output: Compiled artifacts in `artifacts/` directory

### Run Tests

```bash
npm run test
```

Output: Test results with passing/failing counts

### Run Tests on Sepolia

```bash
npm run test:sepolia
```

Requires environment variables:
- `PRIVATE_KEY`: Your wallet private key
- `SEPOLIA_RPC_URL`: Sepolia RPC endpoint

### Deploy a Contract

```bash
npm run deploy
```

For Sepolia:
```bash
npm run deploy:sepolia
```

### Generate Documentation

```bash
npm run generate-docs certificate-issuance
npm run generate-all-docs
```

Generated docs appear in `docs/` directory

## Create a Category

Group related examples:

```bash
npm run create-category basic ./my-basic-examples
cd my-basic-examples
npm install
npm run test
```

## Project Layout

```
Project Root
├── contracts/          - Smart contracts
├── test/              - Test files
├── scripts/           - Automation scripts
├── docs/              - Documentation
└── README.md          - Main documentation
```

## View Examples

Existing examples in `contracts/examples/`:
- `CertificateIssuance.sol` - Issue encrypted certificates
- `EncryptedScore.sol` - Manage encrypted scores

## Write Your Own Contract

1. Create `contracts/MyContract.sol`
2. Create `test/MyContract.test.ts`
3. Run `npm run compile`
4. Run `npm run test`

## Deploy Your Contract

1. Set environment variables:
   ```bash
   export PRIVATE_KEY=your_key
   export SEPOLIA_RPC_URL=your_rpc
   ```

2. Update `scripts/deploy.js` with your contract

3. Run deployment:
   ```bash
   npm run deploy:sepolia
   ```

## Next Steps

- Read the [full README](../README.md)
- Explore [example contracts](../contracts/examples/)
- Review [setup guide](setup.md)
- Check [API reference](api/)

## Common Commands Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run compile` | Compile contracts |
| `npm run test` | Run tests |
| `npm run deploy` | Deploy contracts |
| `npm run create-example <name>` | Generate example |
| `npm run generate-docs <name>` | Generate docs |

## Troubleshooting

**Tests fail**: Clear cache and rebuild
```bash
rm -rf artifacts cache
npm run compile
npm run test
```

**Compilation error**: Check Solidity version
```bash
npm run compile --verbose
```

**Module not found**: Reinstall dependencies
```bash
rm -rf node_modules
npm install
```

Ready to start? Explore the [examples](../contracts/examples/) or create your own!
