const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");
  
  try {
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    // Check balance
    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");
    
    // Deploy PrivacyProfessionalCertificate
    console.log("\nDeploying PrivacyProfessionalCertificate...");
    const Certificate = await hre.ethers.getContractFactory("PrivacyProfessionalCertificate");
    const certificate = await Certificate.deploy();
    await certificate.deployed();
    console.log("PrivacyProfessionalCertificate deployed to:", certificate.address);
    
    // Deploy example contracts
    console.log("\nDeploying CertificateIssuance...");
    const CertIssuance = await hre.ethers.getContractFactory("CertificateIssuance");
    const certIssuance = await CertIssuance.deploy();
    await certIssuance.deployed();
    console.log("CertificateIssuance deployed to:", certIssuance.address);
    
    console.log("\nDeploying EncryptedScore...");
    const Score = await hre.ethers.getContractFactory("EncryptedScore");
    const score = await Score.deploy();
    await score.deployed();
    console.log("EncryptedScore deployed to:", score.address);
    
    // Save deployment addresses
    const deploymentInfo = {
      network: hre.network.name,
      deployer: deployer.address,
      deploymentDate: new Date().toISOString(),
      contracts: {
        PrivacyProfessionalCertificate: certificate.address,
        CertificateIssuance: certIssuance.address,
        EncryptedScore: score.address
      }
    };
    
    console.log("\nDeployment Summary:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    // Save to file
    const fs = require("fs");
    const path = require("path");
    const deploymentFile = path.join(__dirname, `../deployments/${hre.network.name}.json`);
    const deploymentDir = path.dirname(deploymentFile);
    
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }
    
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\nDeployment info saved to: ${deploymentFile}`);
    
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
