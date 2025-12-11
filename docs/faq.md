# Frequently Asked Questions

## Installation & Setup

### Q: Do I need Node.js to use this project?
**A**: Yes, Node.js 16+ is required. Install from nodejs.org.

### Q: What about Windows vs. Mac/Linux?
**A**: All platforms are supported. Use native commands for your OS.

### Q: Getting "cannot find module" errors?
**A**: Run `npm install` to install dependencies.

## Development

### Q: How do I compile contracts?
**A**: Use `npm run compile` in the project root.

### Q: Where should I put my contracts?
**A**: Place contracts in the `contracts/` directory.

### Q: How do I run tests?
**A**: Use `npm run test` to run all tests.

### Q: Can I test on Sepolia?
**A**: Yes, use `npm run test:sepolia` with proper environment variables.

## Automation Tools

### Q: How do I generate a new example?
**A**: Use `npm run create-example <name> <path>`.

### Q: What examples are available?
**A**: Check the list in create-fhevm-example.ts or run without arguments.

### Q: Can I create my own examples?
**A**: Yes, add to EXAMPLES in create-fhevm-example.ts.

### Q: How do I generate documentation?
**A**: Use `npm run generate-docs <example>` or `npm run generate-all-docs`.

## FHEVM Concepts

### Q: What is FHEVM?
**A**: FHEVM allows smart contracts to process encrypted data without decryption.

### Q: Why use euint64 instead of uint64?
**A**: euint64 stores encrypted data, providing privacy.

### Q: Can I use regular uint with encrypted data?
**A**: No, you must use encrypted types (euint8, euint64, etc.).

### Q: How do I decrypt encrypted values?
**A**: Use FHE.allowThis() or FHE.allow() to grant decryption rights.

## Contracts

### Q: Can I modify the example contracts?
**A**: Yes, edit files in contracts/ and recompile.

### Q: What happens if I change contract code?
**A**: Recompile and redeploy to apply changes.

### Q: How do I add new functions?
**A**: Add function to contract file, compile, test, and deploy.

### Q: What are the security implications of changes?
**A**: Always review security considerations and run tests.

## Testing

### Q: Why are tests failing?
**A**: Check error message, verify contract compiles, inspect test code.

### Q: How do I write new tests?
**A**: See test/examples/ for patterns and use Chai assertions.

### Q: What's a good test coverage target?
**A**: Aim for 100% of critical functions, especially access control.

### Q: How do I debug failing tests?
**A**: Add console.log() statements or use `npm run test -- --verbose`.

## Deployment

### Q: How do I deploy to Sepolia?
**A**: Set PRIVATE_KEY and SEPOLIA_RPC_URL, then `npm run deploy:sepolia`.

### Q: Where are my contract addresses?
**A**: Check `deployments/sepolia.json` after deployment.

### Q: Can I redeploy to replace a contract?
**A**: Yes, deploy again to create a new instance (contracts are immutable).

### Q: How do I save deployment addresses?
**A**: They're automatically saved in deployments/ directory.

## Environment Variables

### Q: What environment variables do I need?
**A**: See .env.example for required variables.

### Q: Is .env file secure?
**A**: .env is git-ignored but still readable locally. Protect your keys!

### Q: Can I use test keys?
**A**: Yes, use test accounts with no real funds for development.

## Errors & Troubleshooting

### Q: "Contract not found" error?
**A**: Ensure contract file exists in contracts/ and is properly named.

### Q: "Compilation failed" error?
**A**: Run `npm run compile --verbose` to see detailed errors.

### Q: "Not authorized" error in tests?
**A**: Check that test uses correct sender address (check beforeEach setup).

### Q: "Insufficient funds" on Sepolia?
**A**: Add ETH from faucet or testnet providers.

### Q: Tests timeout?
**A**: Increase timeout in hardhat.config.ts or check for infinite loops.

### Q: Can't connect to Sepolia?
**A**: Verify RPC_URL is correct and accessible.

## Documentation

### Q: Where is the documentation?
**A**: See docs/ directory for guides and examples.

### Q: Can I generate my own documentation?
**A**: Yes, use generate-docs.ts and customize the output.

### Q: How do I write better contract documentation?
**A**: Use JSDoc-style comments in contracts for auto-generation.

## Contributing

### Q: Can I add new examples?
**A**: Yes, follow the pattern and submit as contribution.

### Q: How do I submit improvements?
**A**: Follow contribution guidelines in contributing/ docs.

### Q: Can I modify existing examples?
**A**: Yes, but maintain compatibility and test thoroughly.

## Advanced Topics

### Q: How do I optimize gas usage?
**A**: See advanced/gas-optimization.md for techniques.

### Q: Is this ready for production?
**A**: Conduct security audit before mainnet deployment.

### Q: What about scaling?
**A**: Current design handles typical volumes; plan for growth.

### Q: Can I use with other FHEVM tools?
**A**: Yes, contracts are standard Solidity with FHEVM additions.

## Getting Help

### Q: Where can I find more information?
**A**: Check:
- docs/ directory
- Code comments
- Hardhat documentation
- FHEVM documentation

### Q: How do I report issues?
**A**: Document the issue and provide steps to reproduce.

### Q: Is there a community forum?
**A**: Check Zama community resources for discussion.

## Performance & Optimization

### Q: How many certificates can I issue?
**A**: Limited by blockchain state size; practically millions with optimization.

### Q: Will encryption slow things down?
**A**: Encrypted operations use FHE which has overhead but is optimized.

### Q: How do I reduce gas costs?
**A**: Use efficient contracts, batch operations, minimize storage.

## Version & Updates

### Q: What version is this?
**A**: Check package.json for version number.

### Q: Will there be updates?
**A**: Yes, regular updates for dependencies and features.

### Q: How do I update?
**A**: `npm update` for dependencies, `git pull` for code.

## Legal & Compliance

### Q: Is this production-ready?
**A**: For professional use, conduct full security audit first.

### Q: What about GDPR compliance?
**A**: Encryption helps; review privacy regulations for your jurisdiction.

### Q: Can I use this commercially?
**A**: Check license (BSD-3-Clause-Clear) for terms.

---

Still have questions? Refer to the main README or check documentation files.
