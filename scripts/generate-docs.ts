import fs from "fs-extra";
import path from "path";

interface DocMetadata {
  chapter?: string;
  title?: string;
  description?: string;
}

const EXAMPLES_METADATA: Record<string, DocMetadata> = {
  "certificate-issuance": {
    chapter: "basic",
    title: "Certificate Issuance",
    description: "How to issue encrypted professional certificates",
  },
  "encrypted-score": {
    chapter: "basic",
    title: "Encrypted Score Management",
    description: "Managing professional scores with encryption",
  },
  "user-decryption": {
    chapter: "decryption",
    title: "User Decryption",
    description: "User-controlled decryption patterns",
  },
};

async function generateDocumentation(exampleName: string) {
  const metadata = EXAMPLES_METADATA[exampleName];

  if (!metadata) {
    console.error(`Documentation for ${exampleName} not found`);
    process.exit(1);
  }

  const docContent = `# ${metadata.title}

## Overview
${metadata.description}

## Chapter: ${metadata.chapter}

This example demonstrates key concepts in the ${metadata.chapter} category.

## Key Concepts

- FHEVM encryption and decryption
- Smart contract security patterns
- Professional credential management

## Code Structure

Refer to the contract files in the repository for implementation details.

## Testing

Run tests with: npm test

## Further Reading

- FHEVM Documentation
- Solidity Best Practices
`;

  const docsDir = path.join(process.cwd(), "docs");
  await fs.ensureDir(docsDir);
  await fs.writeFile(path.join(docsDir, `${exampleName}.md`), docContent);

  console.log(`Documentation generated for ${exampleName}`);
}

const exampleName = process.argv[2];

if (!exampleName) {
  console.log("Usage: ts-node generate-docs.ts <example-name>");
  process.exit(1);
}

generateDocumentation(exampleName);
