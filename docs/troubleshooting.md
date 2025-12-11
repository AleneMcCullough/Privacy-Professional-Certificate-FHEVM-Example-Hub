# Troubleshooting Guide

## Installation Issues

### Issue: npm install fails

**Symptoms**:
```
npm ERR! code E403
npm ERR! 403 Forbidden
```

**Solutions**:
1. Check npm registry: `npm config get registry`
2. Clear npm cache: `npm cache clean --force`
3. Update npm: `npm install -g npm@latest`
4. Try again: `npm install`

### Issue: Node version mismatch

**Symptoms**:
```
Node version xx.x.x is not supported
```

**Solutions**:
1. Check version: `node --version`
2. Install Node 16+: Download from nodejs.org
3. Verify: `node --version` shows 16+

### Issue: Module not found

**Symptoms**:
```
Cannot find module '@fhevm/solidity'
```

**Solutions**:
1. Install dependencies: `npm install`
2. Clear cache: `rm -rf node_modules && npm install`
3. Check package.json for correct version

## Compilation Issues

### Issue: Solidity compilation fails

**Symptoms**:
```
SyntaxError: Unexpected token
```

**Solutions**:
1. Check Solidity version: `pragma solidity ^0.8.24;`
2. Run with verbose: `npm run compile -- --verbose`
3. Review error line number
4. Check for typos in contract

### Issue: Import errors

**Symptoms**:
```
Source "@fhevm/solidity/..." not found
```

**Solutions**:
1. Verify FHEVM installed: `npm list @fhevm/solidity`
2. Check import paths are correct
3. Reinstall: `npm install @fhevm/solidity`

### Issue: Contract not found

**Symptoms**:
```
Error: Contract not found: ContractName
```

**Solutions**:
1. Verify file exists: `contracts/ContractName.sol`
2. Check file naming (case-sensitive on Linux/Mac)
3. Ensure file is saved
4. Recompile: `npm run compile`

## Testing Issues

### Issue: Tests fail to run

**Symptoms**:
```
Error: No tests found matching
```

**Solutions**:
1. Verify test files exist: `test/examples/`
2. Check test file naming: `*.test.ts`
3. Check test syntax
4. Run specific test: `npm run test -- test/examples/`

### Issue: Test times out

**Symptoms**:
```
Timeout of 40000ms exceeded
```

**Solutions**:
1. Increase timeout in hardhat.config.ts:
   ```javascript
   mocha: {
     timeout: 60000
   }
   ```
2. Check for infinite loops
3. Simplify test
4. Run single test: `npm run test -- --grep "TestName"`

### Issue: "Not authorized" in tests

**Symptoms**:
```
Error: Only issuer can call
```

**Solutions**:
1. Check beforeEach setup
2. Verify sender address: `owner`, `holder`, etc.
3. Check contract authorization logic
4. Confirm test uses correct signer

### Issue: Contract not deployed in tests

**Symptoms**:
```
Cannot read property 'address' of undefined
```

**Solutions**:
1. Check beforeEach calls deploy
2. Verify Factory has correct name
3. Check for compilation errors first
4. Add error logging to beforeEach

## Deployment Issues

### Issue: Cannot connect to Sepolia

**Symptoms**:
```
Error: could not detect network
```

**Solutions**:
1. Check RPC URL: `echo $SEPOLIA_RPC_URL`
2. Verify URL is correct
3. Check internet connection
4. Try different RPC provider

### Issue: Insufficient funds

**Symptoms**:
```
Error: sender doesn't have enough funds
```

**Solutions**:
1. Check balance: `ethers balance <address> --network sepolia`
2. Get testnet ETH from faucet
3. Wait for confirmation
4. Try again

### Issue: Private key error

**Symptoms**:
```
Error: invalid private key
```

**Solutions**:
1. Check .env file exists
2. Verify PRIVATE_KEY format (hex without 0x prefix)
3. Ensure quotes removed if present
4. Never include 0x prefix

### Issue: Transaction reverted

**Symptoms**:
```
Error: Transaction reverted: contract error
```

**Solutions**:
1. Check contract requirements are met
2. Verify authorization is correct
3. Check input parameters are valid
4. Review contract logic

### Issue: High gas costs

**Symptoms**:
Deployment costs 10+ ETH

**Solutions**:
1. Optimize contract size
2. Check for infinite loops
3. Reduce number of operations
4. Use appropriate data types

## Environment Setup

### Issue: .env not being read

**Symptoms**:
```
Error: PRIVATE_KEY is undefined
```

**Solutions**:
1. Create .env file (not .env.example)
2. Verify file location (project root)
3. Check file permissions: `ls -la .env`
4. Add to .gitignore for safety

### Issue: Environment variables not working

**Symptoms**:
Variables undefined in scripts

**Solutions**:
1. Ensure dotenv is loaded
2. Check variable names match
3. Source .env: `source .env`
4. Verify syntax in .env file

## Project Structure Issues

### Issue: Files in wrong location

**Symptoms**:
Contracts not found or tests not running

**Solutions**:
Correct structure:
```
project/
├── contracts/          # Smart contracts
│   └── examples/
├── test/              # Test files
│   └── examples/
├── scripts/           # Deploy/automation
├── docs/              # Documentation
└── hardhat.config.ts
```

### Issue: Imports failing

**Symptoms**:
```
Cannot find module './path'
```

**Solutions**:
1. Check path is relative: `../`
2. Verify file exists at that path
3. Check case sensitivity (Linux/Mac)
4. Use absolute paths in hardhat config

## TypeScript Issues

### Issue: TypeScript compilation error

**Symptoms**:
```
error TS2322: Type '{}' is not assignable to type
```

**Solutions**:
1. Check tsconfig.json
2. Review type definitions
3. Install types: `npm install --save-dev @types/node`
4. Verify TypeScript version

## Git Issues

### Issue: Commits failing

**Symptoms**:
Hooks prevent commits

**Solutions**:
1. Check .git/hooks
2. Review files being committed
3. Ensure no .env with real keys
4. Stage only necessary files

### Issue: Merge conflicts

**Symptoms**:
Cannot merge branches

**Solutions**:
1. Review conflicts carefully
2. Keep important changes
3. Remove markers before committing
4. Test after merge

## Performance Issues

### Issue: Slow compilation

**Solutions**:
1. Check disk space
2. Clear cache: `rm -rf artifacts cache`
3. Update Hardhat: `npm update hardhat`
4. Reduce contract complexity

### Issue: Slow tests

**Solutions**:
1. Run specific test: `npm run test -- --grep "name"`
2. Reduce number of tests run
3. Check for network calls
4. Profile with timing

## Network Issues

### Issue: Network timeouts

**Symptoms**:
Tests timeout connecting to network

**Solutions**:
1. Check internet connection
2. Verify RPC endpoint is accessible
3. Try different RPC provider
4. Increase timeout value

### Issue: Nonce conflicts

**Symptoms**:
```
Error: nonce too high
```

**Solutions**:
1. Check for multiple pending transactions
2. Wait for previous transaction confirmation
3. Reset nonce if needed
4. Use single account

## Documentation Issues

### Issue: Documentation not generating

**Symptoms**:
```
No documentation created
```

**Solutions**:
1. Check example name is correct
2. Verify metadata exists
3. Check output path permissions
4. Review script for errors

## Getting More Help

### Check These Resources

1. **Error Message**: Copy and search exact error
2. **Docs**: Review docs/ for related topic
3. **Examples**: Check test files for patterns
4. **Logs**: Add console.log() for debugging
5. **Issues**: Search GitHub issues

### Debug Techniques

1. **Add Logging**:
   ```javascript
   console.log("Variable:", variable);
   ```

2. **Verbose Output**:
   ```bash
   npm run compile -- --verbose
   npm run test -- --verbose
   ```

3. **Inspect State**:
   ```javascript
   console.log(await contract.getState());
   ```

4. **Test in Isolation**:
   ```bash
   npm run test -- --grep "specific test"
   ```

## Still Stuck?

1. Review error message carefully
2. Check documentation relevant to issue
3. Search for similar issues
4. Simplify to minimal reproduction
5. Ask for help with clear details

---

For additional help, consult:
- Hardhat Documentation
- Solidity Documentation
- FHEVM Documentation
- Community Forums
