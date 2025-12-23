#!/usr/bin/env ts-node

/**
 * create-fhevm-example - CLI tool to generate standalone FHEVM example repositories
 *
 * Usage: ts-node scripts/create-fhevm-example.ts <example-name> [output-dir]
 *
 * Example: ts-node scripts/create-fhevm-example.ts fhe-counter ./my-fhe-counter
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Color codes for terminal output
enum Color {
  Reset = '\x1b[0m',
  Green = '\x1b[32m',
  Blue = '\x1b[34m',
  Yellow = '\x1b[33m',
  Red = '\x1b[31m',
  Cyan = '\x1b[36m',
}

function log(message: string, color: Color = Color.Reset): void {
  console.log(`${color}${message}${Color.Reset}`);
}

function error(message: string): never {
  log(`❌ Error: ${message}`, Color.Red);
  process.exit(1);
}

function success(message: string): void {
  log(`✅ ${message}`, Color.Green);
}

function info(message: string): void {
  log(`ℹ️  ${message}`, Color.Blue);
}

// Example configuration interface
interface ExampleConfig {
  contract: string;
  test: string;
  description: string;
  category: string;
}

// Map of example names to their contract and test paths
const EXAMPLES_MAP: Record<string, ExampleConfig> = {
  'fhe-counter': {
    contract: 'contracts/basic/FHECounter.sol',
    test: 'test/basic/FHECounter.test.ts',
    description: 'A simple FHE counter demonstrating basic encrypted operations',
    category: 'basic',
  },
  'arithmetic-operations': {
    contract: 'contracts/basic/ArithmeticOperations.sol',
    test: 'test/basic/ArithmeticOperations.test.ts',
    description: 'Demonstrates FHE arithmetic operations (add, sub, mul)',
    category: 'basic',
  },
  'comparison-operations': {
    contract: 'contracts/basic/ComparisonOperations.sol',
    test: 'test/basic/ComparisonOperations.test.ts',
    description: 'Shows FHE comparison operations (eq, gt, lt)',
    category: 'basic',
  },
  'encrypt-single-value': {
    contract: 'contracts/encryption/EncryptSingleValue.sol',
    test: 'test/encryption/EncryptSingleValue.test.ts',
    description: 'Demonstrates how to encrypt a single value using FHEVM',
    category: 'encryption',
  },
  'encrypt-multiple-values': {
    contract: 'contracts/encryption/EncryptMultipleValues.sol',
    test: 'test/encryption/EncryptMultipleValues.test.ts',
    description: 'Shows how to encrypt and handle multiple values',
    category: 'encryption',
  },
  'user-decrypt-single': {
    contract: 'contracts/decryption/UserDecryptSingleValue.sol',
    test: 'test/decryption/UserDecryptSingleValue.test.ts',
    description: 'Demonstrates user decryption of a single encrypted value',
    category: 'decryption',
  },
  'user-decrypt-multiple': {
    contract: 'contracts/decryption/UserDecryptMultipleValues.sol',
    test: 'test/decryption/UserDecryptMultipleValues.test.ts',
    description: 'Shows how to decrypt multiple encrypted values',
    category: 'decryption',
  },
  'public-decrypt-single': {
    contract: 'contracts/decryption/PublicDecryptSingleValue.sol',
    test: 'test/decryption/PublicDecryptSingleValue.test.ts',
    description: 'Demonstrates public decryption mechanism',
    category: 'decryption',
  },
  'public-decrypt-multiple': {
    contract: 'contracts/decryption/PublicDecryptMultipleValues.sol',
    test: 'test/decryption/PublicDecryptMultipleValues.test.ts',
    description: 'Shows public decryption with multiple values',
    category: 'decryption',
  },
  'access-control': {
    contract: 'contracts/access/AccessControlExample.sol',
    test: 'test/access/AccessControlExample.test.ts',
    description: 'Demonstrates FHE.allow and FHE.allowTransient for access control',
    category: 'access-control',
  },
  'input-proof': {
    contract: 'contracts/access/InputProofExample.sol',
    test: 'test/access/InputProofExample.test.ts',
    description: 'Explains what input proofs are and why they are needed',
    category: 'access-control',
  },
  'anti-patterns': {
    contract: 'contracts/access/AntiPatterns.sol',
    test: 'test/access/AntiPatterns.test.ts',
    description: 'Common mistakes and anti-patterns with FHEVM',
    category: 'anti-patterns',
  },
  'blind-auction': {
    contract: 'contracts/advanced/BlindAuction.sol',
    test: 'test/advanced/BlindAuction.test.ts',
    description: 'Sealed-bid auction with confidential bids',
    category: 'advanced',
  },
  'confidential-erc20': {
    contract: 'contracts/openzeppelin/ConfidentialERC20.sol',
    test: 'test/openzeppelin/ConfidentialERC20.test.ts',
    description: 'ERC7984 confidential token standard implementation',
    category: 'openzeppelin',
  },
  'erc20-wrapper': {
    contract: 'contracts/openzeppelin/ConfidentialERC20Wrapper.sol',
    test: 'test/openzeppelin/ConfidentialERC20Wrapper.test.ts',
    description: 'Wrapper to convert standard ERC20 to confidential tokens',
    category: 'openzeppelin',
  },
  'vesting-wallet': {
    contract: 'contracts/openzeppelin/ConfidentialVestingWallet.sol',
    test: 'test/openzeppelin/ConfidentialVestingWallet.test.ts',
    description: 'Confidential token vesting with encrypted allocation',
    category: 'openzeppelin',
  },
};

function copyDirectoryRecursive(source: string, destination: string): void {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const items = fs.readdirSync(source);

  items.forEach(item => {
    const sourcePath = path.join(source, item);
    const destPath = path.join(destination, item);
    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      // Skip node_modules, artifacts, cache, etc.
      if (['node_modules', 'artifacts', 'cache', 'coverage', 'types', 'dist', 'frontend'].includes(item)) {
        return;
      }
      copyDirectoryRecursive(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}

function getContractName(contractPath: string): string | null {
  const content = fs.readFileSync(contractPath, 'utf-8');
  // Match contract declaration
  const match = content.match(/^\s*contract\s+(\w+)(?:\s+is\s+|\s*\{)/m);
  return match ? match[1] : null;
}

function updateDeployScript(outputDir: string, contractName: string): void {
  const deployScriptPath = path.join(outputDir, 'scripts', 'deploy.js');

  const deployScript = `const hre = require("hardhat");

async function main() {
  console.log("Deploying ${contractName}...");

  const Contract = await hre.ethers.getContractFactory("${contractName}");
  const contract = await Contract.deploy();

  await contract.deployed();

  console.log("${contractName} deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
`;

  // Ensure scripts directory exists
  const scriptsDir = path.join(outputDir, 'scripts');
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
  }

  fs.writeFileSync(deployScriptPath, deployScript);
}

function updatePackageJson(outputDir: string, exampleName: string, description: string): void {
  const packageJsonPath = path.join(outputDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  packageJson.name = `fhevm-example-${exampleName}`;
  packageJson.description = description;
  packageJson.homepage = `https://github.com/fhevm-examples/${exampleName}`;

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

function generateReadme(exampleName: string, description: string, contractName: string, category: string): string {
  return `# FHEVM Example: ${exampleName}

${description}

## Category: ${category}

## Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Package manager

### Installation

1. **Install dependencies**

   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables**

   \`\`\`bash
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   \`\`\`

3. **Compile and test**

   \`\`\`bash
   npm run compile
   npm run test
   \`\`\`

## Contract

The main contract is \`${contractName}\` located in \`contracts/${contractName}.sol\`.

## Testing

Run the test suite:

\`\`\`bash
npm run test
\`\`\`

For Sepolia testnet testing:

\`\`\`bash
npm run test:sepolia
\`\`\`

## Deployment

Deploy to local network:

\`\`\`bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
\`\`\`

Deploy to Sepolia:

\`\`\`bash
npx hardhat run scripts/deploy.js --network sepolia
\`\`\`

## Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Examples](https://docs.zama.org/protocol/examples)
- [FHEVM Hardhat Plugin](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)

## License

This project is licensed under the BSD-3-Clause-Clear License.

---

**Built with FHEVM by Zama**
`;
}

function createExample(exampleName: string, outputDir: string): void {
  const rootDir = path.resolve(__dirname, '..');
  const templateDir = path.join(rootDir, 'fhevm-hardhat-template');

  // Check if example exists
  if (!EXAMPLES_MAP[exampleName]) {
    error(`Unknown example: ${exampleName}\n\nAvailable examples:\n${Object.keys(EXAMPLES_MAP).map(k => `  - ${k}: ${EXAMPLES_MAP[k].description}`).join('\n')}`);
  }

  const example = EXAMPLES_MAP[exampleName];
  const contractPath = path.join(rootDir, example.contract);
  const testPath = path.join(rootDir, example.test);

  // Validate paths exist
  if (!fs.existsSync(contractPath)) {
    error(`Contract not found: ${example.contract}`);
  }
  if (!fs.existsSync(testPath)) {
    error(`Test not found: ${example.test}`);
  }

  info(`Creating FHEVM example: ${exampleName}`);
  info(`Output directory: ${outputDir}`);

  // Step 1: Copy template
  log('\n📋 Step 1: Copying template...', Color.Cyan);
  if (fs.existsSync(outputDir)) {
    error(`Output directory already exists: ${outputDir}`);
  }
  copyDirectoryRecursive(templateDir, outputDir);
  success('Template copied');

  // Step 2: Copy contract
  log('\n📄 Step 2: Copying contract...', Color.Cyan);
  const contractName = getContractName(contractPath);
  if (!contractName) {
    error('Could not extract contract name from contract file');
  }
  const destContractPath = path.join(outputDir, 'contracts', `${contractName}.sol`);

  // Ensure contracts directory exists
  const contractsDir = path.join(outputDir, 'contracts');
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // Remove template contract if it exists
  const templateContract = path.join(outputDir, 'contracts', 'TemplateContract.sol');
  if (fs.existsSync(templateContract)) {
    fs.unlinkSync(templateContract);
  }

  fs.copyFileSync(contractPath, destContractPath);
  success(`Contract copied: ${contractName}.sol`);

  // Step 3: Copy test
  log('\n🧪 Step 3: Copying test...', Color.Cyan);
  const testDir = path.join(outputDir, 'test');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const destTestPath = path.join(testDir, path.basename(testPath));

  // Remove template tests
  if (fs.existsSync(testDir)) {
    fs.readdirSync(testDir).forEach(file => {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        fs.unlinkSync(path.join(testDir, file));
      }
    });
  }

  fs.copyFileSync(testPath, destTestPath);
  success(`Test copied: ${path.basename(testPath)}`);

  // Step 4: Update configuration files
  log('\n⚙️  Step 4: Updating configuration...', Color.Cyan);
  updateDeployScript(outputDir, contractName);
  updatePackageJson(outputDir, exampleName, example.description);
  success('Configuration updated');

  // Step 5: Generate README
  log('\n📝 Step 5: Generating README...', Color.Cyan);
  const readme = generateReadme(exampleName, example.description, contractName, example.category);
  fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
  success('README.md generated');

  // Final summary
  log('\n' + '='.repeat(60), Color.Green);
  success(`FHEVM example "${exampleName}" created successfully!`);
  log('='.repeat(60), Color.Green);

  log('\n📦 Next steps:', Color.Yellow);
  log(`  cd ${path.relative(process.cwd(), outputDir)}`);
  log('  npm install');
  log('  npm run compile');
  log('  npm run test');

  log('\n🎉 Happy coding with FHEVM!', Color.Cyan);
}

// Main execution
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    log('FHEVM Example Generator', Color.Cyan);
    log('\nUsage: ts-node scripts/create-fhevm-example.ts <example-name> [output-dir]\n');
    log('Available examples:', Color.Yellow);
    Object.entries(EXAMPLES_MAP).forEach(([name, info]) => {
      log(`  ${name}`, Color.Green);
      log(`    ${info.description}`, Color.Reset);
      log(`    Category: ${info.category}\n`, Color.Blue);
    });
    log('Example:', Color.Yellow);
    log('  ts-node scripts/create-fhevm-example.ts fhe-counter ./my-fhe-counter\n');
    process.exit(0);
  }

  const exampleName = args[0];
  const outputDir = args[1] || path.join(process.cwd(), 'output', `fhevm-example-${exampleName}`);

  createExample(exampleName, outputDir);
}

main();
