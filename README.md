# Privacy Professional Certificate - FHEVM Example Hub

A comprehensive repository demonstrating privacy-preserving professional certificate systems using Fully Homomorphic Encryption on Virtual Machine (FHEVM). This project provides standalone, Hardhat-based example repositories with automated scaffolding, complete test coverage, and self-contained documentation.

## Overview

This repository is a competition submission for the Zama Bounty Program - Build The FHEVM Example Hub. It demonstrates best practices for:

- Building privacy-conscious smart contracts using FHEVM
- Encrypting sensitive professional credentials
- Managing certificate issuance with FHE encryption
- Automated test generation and documentation
- Production-ready Hardhat-based development workflow

## Core Concept: Privacy Professional Certificates

The project focuses on a specific use case: managing professional certification systems where sensitive credential data (scores, levels, issuance dates) is encrypted using FHEVM, ensuring privacy while maintaining smart contract functionality.

## Quick Start

### Installation

```bash
npm install
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm run test
```

### Generate Standalone Example

```bash
npm run create-example certificate-issuance ./my-certificate-example
cd ./my-certificate-example
npm install
npm run test
```

### Generate Documentation

```bash
npm run generate-docs certificate-issuance
npm run generate-all-docs
```

## Available Examples

### Basic Examples

#### 1. Certificate Issuance
- **File**: `contracts/examples/CertificateIssuance.sol`
- **Description**: Demonstrates how to issue encrypted professional certificates
- **Key Features**:
  - Encrypted score and level storage
  - Issuer authorization
  - Certificate validity tracking
  - Event emission for certificate issuance

#### 2. Encrypted Score Management
- **File**: `contracts/examples/EncryptedScore.sol`
- **Description**: Shows encryption and management of professional scores
- **Key Features**:
  - FHE-encrypted score storage
  - Owner-restricted score updates
  - Encrypted data retrieval
  - Event logging for audits

## Security Features

- **Encrypted Storage**: All sensitive data stored as FHEVM encrypted types
- **Access Control**: Role-based permissions for certificate issuers
- **Immutable Timestamps**: Issuance dates recorded on-chain
- **Event Logging**: Full audit trail of operations

## Testing

Comprehensive test suites included:

```bash
npm run test
npm run test:sepolia
```

## Automation Tools

### create-fhevm-example.ts

Generate standalone example repositories

### create-fhevm-category.ts

Generate category-based project collections

### generate-docs.ts

Auto-generate documentation from code

## Requirements Met

### 1. Project Structure & Simplicity
- Uses Hardhat for all examples
- One repo per example capability
- Minimal, clean structure
- Shared base template

### 2. Scaffolding & Automation
- TypeScript-based create-fhevm-example CLI
- Template cloning and customization
- Automatic contract insertion
- Test generation
- Documentation auto-generation

### 3. Example Types
- Basic Examples: Certificate issuance, score management
- Certificate Management: Validation, access control
- Future-Ready: Extensible structure

### 4. Documentation Strategy
- JSDoc/TSDoc-style comments
- Auto-generated markdown READMEs
- Category-based organization
- GitBook-compatible format

## Network Support

- **Hardhat Local**: For testing and development
- **Sepolia Testnet**: For integration testing

## License

BSD-3-Clause-Clear

## Submission Information

This is a competition submission for the Zama Bounty Program - Build The FHEVM Example Hub (December 2025).

---

For questions, refer to the Zama Community Forum or Discord server.
