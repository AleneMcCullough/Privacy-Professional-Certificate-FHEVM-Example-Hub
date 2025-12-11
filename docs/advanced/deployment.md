# Deployment Guide

## Deployment Process

### Step 1: Prepare Environment

Create .env file:

```bash
cp .env.example .env
```

Add configuration:

```
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_private_key
```

**WARNING**: Never commit .env with real keys

### Step 2: Fund Account

Ensure deployer account has sufficient ETH:

```bash
# Check balance
ethers balance <address> --network sepolia
```

Get testnet ETH from faucet if needed.

### Step 3: Compile Contracts

```bash
npm run compile
```

Verify no compilation errors.

### Step 4: Deploy

#### Local Deployment

```bash
npm run deploy
```

#### Sepolia Deployment

```bash
npm run deploy:sepolia
```

### Step 5: Verify Deployment

Check deployed addresses:

```bash
cat deployments/sepolia.json
```

## Deployment Script

Located in `scripts/deploy.js`:

```javascript
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  
  // Deploy main contract
  const Certificate = await ethers.getContractFactory("PrivacyProfessionalCertificate");
  const cert = await Certificate.deploy();
  await cert.deployed();
  
  console.log("Deployed to:", cert.address);
}
```

## Customizing Deployment

### Deploy Specific Contract

Edit `deploy.js` to specify which contracts to deploy:

```javascript
// Deploy only CertificateIssuance
const CertIssuance = await ethers.getContractFactory("CertificateIssuance");
const contract = await CertIssuance.deploy();
```

### Pass Constructor Arguments

```javascript
const Contract = await ethers.getContractFactory("ContractName");
const contract = await Contract.deploy(arg1, arg2);
```

### Set Gas Limits

```javascript
const contract = await Contract.deploy(arg1, {
  gasLimit: 5000000,
  gasPrice: ethers.utils.parseUnits("20", "gwei")
});
```

## Network-Specific Deployment

### Local Hardhat Network

```bash
npm run deploy
```

Contracts deployed to local test network (chainId: 1337)

### Sepolia Testnet

```bash
npm run deploy:sepolia
```

Requires:
- Sepolia RPC URL
- Private key with ETH

## Verification

### Retrieve Deployment Info

```javascript
const fs = require("fs");
const deployment = JSON.parse(
  fs.readFileSync("deployments/sepolia.json", "utf8")
);
console.log(deployment.contracts);
```

### Check Deployment on Explorer

View contract on Etherscan:
- https://sepolia.etherscan.io/address/{contract_address}

### Verify Contract Code

For Etherscan verification:

```bash
npm run verify -- {contract_address} {constructor_args}
```

## Gas Optimization

### Monitor Gas Usage

Run with gas reporting:

```bash
REPORT_GAS=true npm run test
```

### Optimize Contracts

1. Use appropriate types (uint8 vs uint256)
2. Pack state variables
3. Use storage efficiently
4. Minimize external calls

## Troubleshooting

### Insufficient Funds

```
Error: sender doesn't have enough funds to send tx
```

Solution: Add ETH to deployer address

### Network Connection

```
Error: could not detect network
```

Solution: Check RPC_URL is correct

### Transaction Failure

```
Error: transaction failed
```

Check:
- Gas limit is sufficient
- Constructor arguments are correct
- Account has permissions

### Compilation Error

```
Error: SyntaxError
```

Run:

```bash
npm run compile --verbose
```

## Post-Deployment

### Save Deployment Info

Deployment saves to `deployments/{network}.json`

Contains:
- Contract addresses
- Deployer address
- Network name
- Deployment timestamp

### Update Frontend

Update frontend with contract addresses:

```javascript
const ADDRESSES = {
  PrivacyProfessionalCertificate: "0x...",
  CertificateIssuance: "0x...",
  EncryptedScore: "0x..."
};
```

### Monitor Contracts

Track deployed contracts:
- Watch for events
- Monitor state changes
- Track gas usage

## Maintenance

### Updating Contracts

To deploy new versions:

1. Modify contracts
2. Recompile: `npm run compile`
3. Deploy new instances: `npm run deploy:sepolia`
4. Update addresses

### Keeping Records

Maintain deployment records:

```json
{
  "network": "sepolia",
  "timestamp": "2025-12-10T00:00:00Z",
  "deployer": "0x...",
  "contracts": {
    "PrivacyProfessionalCertificate": "0x..."
  }
}
```

## References

- Hardhat Deployment Docs
- Etherscan Verification
- Gas Optimization Tips
