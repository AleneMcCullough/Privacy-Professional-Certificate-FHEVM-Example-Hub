#!/usr/bin/env ts-node

/**
 * create-fhevm-category - CLI tool to generate category-based project collections
 *
 * Usage: ts-node scripts/create-fhevm-category.ts <category-name> [output-dir]
 *
 * Example: ts-node scripts/create-fhevm-category.ts basic ./fhevm-basic-examples
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

// Category configuration
interface CategoryConfig {
  title: string;
  description: string;
  examples: string[];
}

// Map of categories to their examples
const CATEGORIES_MAP: Record<string, CategoryConfig> = {
  'basic': {
    title: 'Basic FHE Examples',
    description: 'Fundamental concepts for working with encrypted values',
    examples: [
      'fhe-counter',
      'arithmetic-operations',
      'comparison-operations',
    ],
  },
  'encryption': {
    title: 'Encryption Examples',
    description: 'How to encrypt values using FHEVM',
    examples: [
      'encrypt-single-value',
      'encrypt-multiple-values',
    ],
  },
  'decryption': {
    title: 'Decryption Examples',
    description: 'User and public decryption patterns',
    examples: [
      'user-decrypt-single',
      'user-decrypt-multiple',
      'public-decrypt-single',
      'public-decrypt-multiple',
    ],
  },
  'access-control': {
    title: 'Access Control Examples',
    description: 'Managing permissions for encrypted values',
    examples: [
      'access-control',
      'input-proof',
      'anti-patterns',
    ],
  },
  'advanced': {
    title: 'Advanced Examples',
    description: 'Complex FHE applications and patterns',
    examples: [
      'blind-auction',
    ],
  },
};

function copyDirectoryRecursive(source: string, destination: string, excludeDirs: string[] = []): void {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const items = fs.readdirSync(source);

  items.forEach(item => {
    if (excludeDirs.includes(item)) {
      return;
    }

    const sourcePath = path.join(source, item);
    const destPath = path.join(destination, item);
    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      copyDirectoryRecursive(sourcePath, destPath, excludeDirs);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}

function generateCategoryReadme(categoryName: string, category: CategoryConfig): string {
  const examplesList = category.examples
    .map(ex => `- **${ex}**: See \`examples/${ex}/README.md\``)
    .join('\n');

  return `# ${category.title}

${category.description}

## Examples in This Category

${examplesList}

## Quick Start

Each example is a standalone project in the \`examples/\` directory.

### To run a specific example:

\`\`\`bash
cd examples/<example-name>
npm install
npm run test
\`\`\`

## Category Overview

### ${category.title}

This category contains ${category.examples.length} example(s) covering:

${category.examples.map((ex, idx) => `${idx + 1}. **${ex}**`).join('\n')}

## Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Package manager

## Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Examples](https://docs.zama.org/protocol/examples)

## License

All examples in this category are licensed under the BSD-3-Clause-Clear License.

---

**Built with FHEVM by Zama**
`;
}

function generatePackageJson(categoryName: string, category: CategoryConfig): string {
  return JSON.stringify(
    {
      name: `fhevm-examples-${categoryName}`,
      version: '1.0.0',
      description: category.description,
      scripts: {
        'install:all': 'npm install && cd examples && for dir in */; do (cd "$dir" && npm install); done',
        'test:all': 'cd examples && for dir in */; do echo "Testing $dir..." && (cd "$dir" && npm test); done',
      },
      keywords: ['fhevm', 'privacy', 'encryption', categoryName],
      author: 'Zama',
      license: 'BSD-3-Clause-Clear',
    },
    null,
    2
  );
}

function generateCategorySummary(categoryName: string, category: CategoryConfig): string {
  return `# ${category.title} - Summary

## Category: ${categoryName}

${category.description}

## Examples Included

${category.examples
  .map(
    (ex, idx) => `
### ${idx + 1}. ${ex}

This example demonstrates key concepts of the ${categoryName} category.
See \`examples/${ex}/\` for implementation details.
`
  )
  .join('')}

## Learning Path

Start with the first example and progress through each one to build your understanding of ${categoryName} concepts.

## Quick Navigation

${category.examples.map(ex => `- [${ex}](./examples/${ex}/README.md)`).join('\n')}

---

For the complete FHEVM documentation, visit: https://docs.zama.ai/fhevm
`;
}

function createCategory(categoryName: string, outputDir: string): void {
  const rootDir = path.resolve(__dirname, '..');

  // Check if category exists
  if (!CATEGORIES_MAP[categoryName]) {
    const availableCategories = Object.keys(CATEGORIES_MAP)
      .map(k => `  - ${k}: ${CATEGORIES_MAP[k].title}`)
      .join('\n');
    error(
      `Unknown category: ${categoryName}\n\nAvailable categories:\n${availableCategories}`
    );
  }

  const category = CATEGORIES_MAP[categoryName];

  info(`Creating FHEVM category project: ${categoryName}`);
  info(`Output directory: ${outputDir}`);

  // Step 1: Create directory structure
  log('\n📁 Step 1: Creating directory structure...', Color.Cyan);
  if (fs.existsSync(outputDir)) {
    error(`Output directory already exists: ${outputDir}`);
  }

  const examplesDir = path.join(outputDir, 'examples');
  fs.mkdirSync(examplesDir, { recursive: true });
  success('Directory structure created');

  // Step 2: Generate package.json
  log('\n📦 Step 2: Creating package.json...', Color.Cyan);
  const packageJsonContent = generatePackageJson(categoryName, category);
  fs.writeFileSync(
    path.join(outputDir, 'package.json'),
    packageJsonContent
  );
  success('package.json created');

  // Step 3: Generate README
  log('\n📝 Step 3: Generating README.md...', Color.Cyan);
  const readmeContent = generateCategoryReadme(categoryName, category);
  fs.writeFileSync(path.join(outputDir, 'README.md'), readmeContent);
  success('README.md created');

  // Step 4: Generate category summary
  log('\n📋 Step 4: Generating category summary...', Color.Cyan);
  const summaryContent = generateCategorySummary(categoryName, category);
  fs.writeFileSync(
    path.join(outputDir, 'CATEGORY_SUMMARY.md'),
    summaryContent
  );
  success('CATEGORY_SUMMARY.md created');

  // Step 5: Create example placeholders
  log('\n🔧 Step 5: Creating example structure...', Color.Cyan);
  category.examples.forEach(example => {
    const exampleDir = path.join(examplesDir, example);
    fs.mkdirSync(exampleDir, { recursive: true });

    // Create placeholder files
    const placeholderReadme = `# ${example}

This example is part of the "${category.title}" category.

## Quick Start

1. Install dependencies: \`npm install\`
2. Run tests: \`npm run test\`
3. Compile contracts: \`npm run compile\`

## More Information

See the parent directory README for more details about this category.

---

For full documentation, see the main project README.
`;

    fs.writeFileSync(
      path.join(exampleDir, 'README.md'),
      placeholderReadme
    );
  });
  success(`Created structure for ${category.examples.length} examples`);

  // Step 6: Create .gitignore
  log('\n🔒 Step 6: Creating .gitignore...', Color.Cyan);
  const gitignore = `node_modules/
dist/
build/
artifacts/
cache/
coverage/
.env
.env.local
.hardhat-node/
*.log
.DS_Store
.vscode/
.idea/
`;
  fs.writeFileSync(path.join(outputDir, '.gitignore'), gitignore);
  success('.gitignore created');

  // Final summary
  log('\n' + '='.repeat(60), Color.Green);
  success(`FHEVM category project "${categoryName}" created successfully!`);
  log('='.repeat(60), Color.Green);

  log('\n📦 Next steps:', Color.Yellow);
  log(`  cd ${path.relative(process.cwd(), outputDir)}`);
  log('  npm run install:all    # Install all examples');
  log('  npm run test:all       # Test all examples');

  log('\n📂 Category Structure:', Color.Cyan);
  log(`  ${outputDir}/`);
  log(`  ├── examples/`);
  category.examples.forEach((ex, idx) => {
    const isLast = idx === category.examples.length - 1;
    log(
      `  ${isLast ? '└─' : '├─'}── ${ex}/`
    );
  });
  log(`  ├── README.md`);
  log(`  ├── CATEGORY_SUMMARY.md`);
  log(`  ├── package.json`);
  log(`  └── .gitignore`);

  log('\n🎉 Happy coding with FHEVM!', Color.Cyan);
}

// Main execution
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    log('FHEVM Category Project Generator', Color.Cyan);
    log(
      '\nUsage: ts-node scripts/create-fhevm-category.ts <category-name> [output-dir]\n'
    );
    log('Available categories:', Color.Yellow);
    Object.entries(CATEGORIES_MAP).forEach(([name, info]) => {
      log(`  ${name}`, Color.Green);
      log(`    ${info.title}`, Color.Cyan);
      log(`    ${info.description}`, Color.Reset);
      log(
        `    Examples: ${info.examples.join(', ')}\n`,
        Color.Blue
      );
    });
    log('Example:', Color.Yellow);
    log(
      '  ts-node scripts/create-fhevm-category.ts basic ./fhevm-basic-examples\n'
    );
    process.exit(0);
  }

  const categoryName = args[0];
  const outputDir =
    args[1] ||
    path.join(process.cwd(), 'output', `fhevm-${categoryName}-examples`);

  createCategory(categoryName, outputDir);
}

main();
