import fs from "fs-extra";
import path from "path";

interface ExampleDefinition {
  name: string;
  title: string;
  description: string;
  category: string;
  contractFile: string;
  testFile: string;
  tags: string[];
}

const EXAMPLES: Record<string, ExampleDefinition> = {
  "certificate-issuance": {
    name: "certificate-issuance",
    title: "Certificate Issuance",
    description: "Demonstrates how to issue encrypted professional certificates with verification",
    category: "basic",
    contractFile: "CertificateIssuance.sol",
    testFile: "CertificateIssuance.ts",
    tags: ["encryption", "certificate", "issuer"],
  },
  "encrypted-score": {
    name: "encrypted-score",
    title: "Encrypted Score Management",
    description: "Shows how to manage and encrypt professional scores using FHEVM",
    category: "basic",
    contractFile: "EncryptedScore.sol",
    testFile: "EncryptedScore.ts",
    tags: ["encryption", "score", "privacy"],
  },
};

async function createExample(exampleName: string, outputPath: string) {
  const example = EXAMPLES[exampleName];

  if (!example) {
    console.error(`Example not found`);
    process.exit(1);
  }

  try {
    await fs.ensureDir(path.join(outputPath, "contracts"));
    await fs.ensureDir(path.join(outputPath, "test"));
    console.log(`Created example: ${example.title}`);
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
}

const exampleName = process.argv[2];
const outputPath = process.argv[3] || `./examples/${exampleName}`;

if (!exampleName) {
  console.log("Usage: ts-node create-fhevm-example.ts <example-name>");
  process.exit(1);
}

createExample(exampleName, outputPath);
