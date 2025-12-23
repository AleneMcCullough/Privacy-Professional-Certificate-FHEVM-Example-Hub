#!/usr/bin/env ts-node

/**
 * generate-docs - Automated documentation generator for FHEVM examples
 *
 * Usage: ts-node scripts/generate-docs.ts [example-name | --all]
 *
 * Example: ts-node scripts/generate-docs.ts fhe-counter
 *          ts-node scripts/generate-docs.ts --all
 */

import * as fs from 'fs';
import * as path from 'path';

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

function success(message: string): void {
  log(`✅ ${message}`, Color.Green);
}

function info(message: string): void {
  log(`ℹ️  ${message}`, Color.Blue);
}

interface DocMetadata {
  chapter: string;
  title: string;
  description: string;
  category: string;
  keyFeatures?: string[];
  useCases?: string[];
}

const EXAMPLES_METADATA: Record<string, DocMetadata> = {
  'fhe-counter': {
    chapter: 'basic',
    title: 'FHE Counter',
    description: 'A simple counter demonstrating basic encrypted operations using FHEVM',
    category: 'Basic Examples',
    keyFeatures: [
      'Encrypted counter state (euint32)',
      'Increment and decrement operations',
      'Access control with FHE.allow',
      'Event emission for tracking',
    ],
    useCases: [
      'Private voting systems',
      'Confidential counters',
      'Anonymous usage tracking',
    ],
  },
  'arithmetic-operations': {
    chapter: 'basic',
    title: 'Arithmetic Operations',
    description: 'Demonstrates FHE arithmetic operations including addition, subtraction, and multiplication',
    category: 'Basic Examples',
    keyFeatures: [
      'FHE.add() for encrypted addition',
      'FHE.sub() for encrypted subtraction',
      'FHE.mul() for encrypted multiplication',
      'Working with different encrypted types',
    ],
    useCases: [
      'Private financial calculations',
      'Confidential computations',
      'Encrypted data processing',
    ],
  },
  'comparison-operations': {
    chapter: 'basic',
    title: 'Comparison Operations',
    description: 'Shows FHE comparison operations including equality and greater/less than',
    category: 'Basic Examples',
    keyFeatures: [
      'FHE.eq() for equality comparison',
      'FHE.gt() for greater than',
      'FHE.lt() for less than',
      'Working with ebool results',
    ],
  },
  'encrypt-single-value': {
    chapter: 'encryption',
    title: 'Encrypt Single Value',
    description: 'Demonstrates how to encrypt a single value using FHEVM',
    category: 'Encryption',
    keyFeatures: [
      'FHE.fromExternal() usage',
      'Input proof validation',
      'Single value encryption',
      'Access control setup',
    ],
  },
  'encrypt-multiple-values': {
    chapter: 'encryption',
    title: 'Encrypt Multiple Values',
    description: 'Shows how to encrypt and handle multiple values of different types',
    category: 'Encryption',
    keyFeatures: [
      'Multi-value encryption (euint64, euint32, euint8)',
      'Struct-based storage',
      'Batch permission grants',
      'Type-safe encryption',
    ],
  },
  'user-decrypt-single': {
    chapter: 'decryption',
    title: 'User Decrypt Single Value',
    description: 'Demonstrates user-controlled decryption of a single encrypted value',
    category: 'Decryption',
    keyFeatures: [
      'User-initiated decryption',
      'FHE.allow() for decryption permission',
      'Request-based decryption pattern',
      'Per-user encrypted storage',
    ],
  },
  'user-decrypt-multiple': {
    chapter: 'decryption',
    title: 'User Decrypt Multiple Values',
    description: 'Shows how users can decrypt multiple encrypted values',
    category: 'Decryption',
    keyFeatures: [
      'Batch decryption requests',
      'Selective value decryption',
      'Multiple encrypted types',
      'Efficient permission management',
    ],
  },
  'public-decrypt-single': {
    chapter: 'decryption',
    title: 'Public Decrypt Single Value',
    description: 'Demonstrates public decryption mechanism for making encrypted values publicly visible',
    category: 'Decryption',
    keyFeatures: [
      'Public decryption workflow',
      'KMS integration pattern',
      'Two-phase decryption (request + fulfill)',
      'Public data availability',
    ],
  },
  'public-decrypt-multiple': {
    chapter: 'decryption',
    title: 'Public Decrypt Multiple Values',
    description: 'Shows public decryption of multiple encrypted values',
    category: 'Decryption',
    keyFeatures: [
      'Batch public decryption',
      'Multiple value types',
      'Efficient KMS callbacks',
      'Public data structures',
    ],
  },
  'access-control': {
    chapter: 'access-control',
    title: 'Access Control',
    description: 'Demonstrates FHE.allow and FHE.allowTransient for managing access to encrypted values',
    category: 'Access Control',
    keyFeatures: [
      'FHE.allow() for persistent access',
      'FHE.allowTransient() for temporary access',
      'Role-based access control',
      'Permission management patterns',
    ],
  },
  'input-proof': {
    chapter: 'access-control',
    title: 'Input Proof Explanation',
    description: 'Explains what input proofs are and why they are critical for FHE security',
    category: 'Access Control',
    keyFeatures: [
      'Input proof validation',
      'Security against replay attacks',
      'Prevention of invalid ciphertexts',
      'User authorization verification',
    ],
  },
  'anti-patterns': {
    chapter: 'anti-patterns',
    title: 'Common Anti-Patterns',
    description: 'Demonstrates common mistakes and anti-patterns to avoid when working with FHEVM',
    category: 'Anti-Patterns',
    keyFeatures: [
      'View function limitations',
      'Permission management errors',
      'Incorrect comparisons',
      'Initialization checks',
      'Event emission mistakes',
    ],
  },
  'blind-auction': {
    chapter: 'advanced',
    title: 'Blind Auction',
    description: 'Advanced sealed-bid auction implementation using FHEVM for confidential bidding',
    category: 'Advanced',
    keyFeatures: [
      'Encrypted bid storage',
      'FHE.gt() for bid comparison',
      'FHE.cmux() for conditional selection',
      'Multi-phase auction workflow',
    ],
    useCases: [
      'Sealed-bid auctions',
      'Confidential tendering',
      'Private voting mechanisms',
    ],
  },
};

function generateDocumentation(exampleName: string): void {
  const metadata = EXAMPLES_METADATA[exampleName];

  if (!metadata) {
    log(`⚠️  No metadata found for ${exampleName}, using defaults`, Color.Yellow);
    return;
  }

  const docContent = `# ${metadata.title}

## Overview

${metadata.description}

**Category**: ${metadata.category}
**Chapter**: ${metadata.chapter}

${metadata.keyFeatures ? `
## Key Features

${metadata.keyFeatures.map(f => `- ${f}`).join('\n')}
` : ''}

${metadata.useCases ? `
## Use Cases

${metadata.useCases.map(u => `- ${u}`).join('\n')}
` : ''}

## Implementation

See the contract source code and tests for complete implementation details:

- **Contract**: \`contracts/${getContractPath(metadata.chapter, exampleName)}\`
- **Tests**: \`test/${getTestPath(metadata.chapter, exampleName)}\`

## Quick Start

\`\`\`bash
# Compile the contract
npm run compile

# Run tests
npm test

# Deploy (local)
npm run deploy
\`\`\`

## Key Concepts

This example demonstrates important FHEVM concepts:

1. **Encryption**: How to handle encrypted values
2. **Access Control**: Managing permissions for encrypted data
3. **Operations**: Performing computations on encrypted values
4. **Best Practices**: Following recommended patterns

## Testing

The test suite includes:

- Basic functionality tests
- Edge case handling
- Access control verification
- Error condition testing
- Best practice demonstrations

Run the tests with:

\`\`\`bash
npm test
\`\`\`

## Further Reading

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Solidity Best Practices](https://docs.soliditylang.org/en/latest/security-considerations.html)
- [FHEVM GitHub Repository](https://github.com/zama-ai/fhevm)

## License

BSD-3-Clause-Clear

---

**Part of the FHEVM Example Hub**
*Built with FHEVM by Zama*
`;

  const docsDir = path.join(process.cwd(), 'docs', 'examples');
  fs.mkdirSync(docsDir, { recursive: true });

  const docPath = path.join(docsDir, `${exampleName}.md`);
  fs.writeFileSync(docPath, docContent);

  success(`Documentation generated: docs/examples/${exampleName}.md`);
}

function getContractPath(chapter: string, exampleName: string): string {
  const mappings: Record<string, string> = {
    'basic': 'basic',
    'encryption': 'encryption',
    'decryption': 'decryption',
    'access-control': 'access',
    'anti-patterns': 'access',
    'advanced': 'advanced',
  };

  return `${mappings[chapter] || chapter}/`;
}

function getTestPath(chapter: string, exampleName: string): string {
  return getContractPath(chapter, exampleName);
}

function generateSummaryDoc(): void {
  const categories = Array.from(
    new Set(Object.values(EXAMPLES_METADATA).map(m => m.category))
  );

  let summaryContent = `# FHEVM Example Hub - Documentation Summary

## Overview

This documentation covers ${Object.keys(EXAMPLES_METADATA).length} FHEVM examples organized into ${categories.length} categories.

## Categories

${categories.map(cat => {
    const examples = Object.entries(EXAMPLES_METADATA)
      .filter(([_, meta]) => meta.category === cat);
    return `### ${cat}

${examples.map(([name, meta]) => `- [${meta.title}](./examples/${name}.md): ${meta.description}`).join('\n')}
`;
  }).join('\n')}

## Navigation

${Object.entries(EXAMPLES_METADATA).map(([name, meta]) =>
  `- [${meta.title}](./examples/${name}.md) - ${meta.category}`
).join('\n')}

## Quick Links

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [GitHub Repository](https://github.com/zama-ai/fhevm)
- [Community Forum](https://www.zama.ai/community)

---

*Generated automatically by the documentation generator*
`;

  const docsDir = path.join(process.cwd(), 'docs');
  fs.mkdirSync(docsDir, { recursive: true });

  fs.writeFileSync(path.join(docsDir, 'SUMMARY.md'), summaryContent);
  success('Generated docs/SUMMARY.md');
}

function generateAllDocs(): void {
  info('Generating documentation for all examples...');

  Object.keys(EXAMPLES_METADATA).forEach(exampleName => {
    generateDocumentation(exampleName);
  });

  generateSummaryDoc();

  log('\n' + '='.repeat(60), Color.Green);
  success(`Generated documentation for ${Object.keys(EXAMPLES_METADATA).length} examples`);
  log('='.repeat(60), Color.Green);
}

// Main execution
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    log('FHEVM Documentation Generator', Color.Cyan);
    log('\nUsage: ts-node scripts/generate-docs.ts [example-name | --all]\n');
    log('Available examples:', Color.Yellow);
    Object.entries(EXAMPLES_METADATA).forEach(([name, info]) => {
      log(`  ${name}`, Color.Green);
      log(`    ${info.title} - ${info.description}\n`, Color.Reset);
    });
    log('Options:', Color.Yellow);
    log('  --all    Generate documentation for all examples\n');
    log('Examples:', Color.Yellow);
    log('  ts-node scripts/generate-docs.ts fhe-counter');
    log('  ts-node scripts/generate-docs.ts --all\n');
    process.exit(0);
  }

  const exampleName = args[0];

  if (exampleName === '--all') {
    generateAllDocs();
  } else {
    if (!EXAMPLES_METADATA[exampleName]) {
      log(`❌ Unknown example: ${exampleName}`, Color.Red);
      log(`\nAvailable examples: ${Object.keys(EXAMPLES_METADATA).join(', ')}`, Color.Yellow);
      process.exit(1);
    }
    generateDocumentation(exampleName);
  }
}

main();
