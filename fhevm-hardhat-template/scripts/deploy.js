const hre = require("hardhat");

async function main() {
  console.log("Deploying TemplateContract...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    const TemplateFactory = await ethers.getContractFactory("TemplateContract");
    const contract = await TemplateFactory.deploy();
    await contract.deployed();
    
    console.log("TemplateContract deployed to:", contract.address);
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
  }
}

main();
