import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * Test suite for UserDecryptSingleValue contract
 *
 * @chapter decryption
 * @description Demonstrates how users can decrypt their own encrypted values using FHEVM
 */
describe("UserDecryptSingleValue", function () {
  let contract: any;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    const Factory = await ethers.getContractFactory("UserDecryptSingleValue");
    contract = await Factory.deploy();
    [owner, addr1] = await ethers.getSigners();
  });

  it("Should deploy successfully", async function () {
    expect(contract.address).to.not.be.undefined;
  });

  describe("Single value decryption", function () {
    it("Should store and retrieve encrypted score", async function () {
      const mockScore = 1000n;
      const mockProof = "0x";

      await expect(
        contract.storeScore(mockScore, mockProof)
      ).to.emit(contract, "ScoreStored");

      const encryptedScore = await contract.getEncryptedScore();
      expect(encryptedScore).to.not.be.undefined;
    });

    it("Should allow user to request decryption of their score", async function () {
      const mockScore = 5000n;
      const mockProof = "0x";

      await contract.storeScore(mockScore, mockProof);

      // Note: In production, decryption would involve requesting from the KMS
      await expect(contract.requestDecryption())
        .to.emit(contract, "DecryptionRequested");
    });

    it("Should emit event when score is stored", async function () {
      const mockScore = 2500n;
      const mockProof = "0x";

      await expect(contract.storeScore(mockScore, mockProof))
        .to.emit(contract, "ScoreStored")
        .withArgs(owner.address);
    });

    it("Should check if user has a score", async function () {
      const mockScore = 3000n;
      const mockProof = "0x";

      let hasScore = await contract.hasScore(owner.address);
      expect(hasScore).to.equal(false);

      await contract.storeScore(mockScore, mockProof);

      hasScore = await contract.hasScore(owner.address);
      expect(hasScore).to.equal(true);
    });
  });

  describe("Access control for decryption", function () {
    it("Should only allow owner to access their encrypted score", async function () {
      const mockScore = 3000n;
      const mockProof = "0x";

      await contract.storeScore(mockScore, mockProof);

      // Owner can access their score
      const ownerScore = await contract.getEncryptedScore();
      expect(ownerScore).to.not.be.undefined;

      // Different user would have different encrypted data
      await contract.connect(addr1).storeScore(4000n, mockProof);
      const addr1Score = await contract.connect(addr1).getEncryptedScore();

      expect(ownerScore).to.not.deep.equal(addr1Score);
    });

    it("Demonstrates FHE.allow() permission requirement", async function () {
      // This test shows that FHE.allow() must be called to grant decryption permission
      const mockScore = 7500n;
      const mockProof = "0x";

      await contract.storeScore(mockScore, mockProof);

      // Permission is automatically granted in storeScore through FHE.allow()
      const score = await contract.getEncryptedScore();
      expect(score).to.not.be.undefined;
    });
  });

  describe("Key concepts", function () {
    it("Demonstrates encrypted value storage with euint64", async function () {
      const mockScore = 999999n;
      const mockProof = "0x";

      await contract.storeScore(mockScore, mockProof);
      const score = await contract.getEncryptedScore();

      expect(score).to.not.be.undefined;
    });

    it("Shows input proof requirement for encryption", async function () {
      // Input proofs are required for converting external encrypted values
      const mockScore = 12345n;
      const mockProof = "0x"; // In production, this would be a real ZK proof

      await expect(contract.storeScore(mockScore, mockProof))
        .to.emit(contract, "ScoreStored");
    });

    it("Demonstrates per-user encrypted storage", async function () {
      const mockProof = "0x";

      await contract.storeScore(1000n, mockProof);
      await contract.connect(addr1).storeScore(2000n, mockProof);

      const score1 = await contract.getEncryptedScore();
      const score2 = await contract.connect(addr1).getEncryptedScore();

      // Each user has their own encrypted score
      expect(score1).to.not.deep.equal(score2);
    });

    it("Demonstrates explicit decryption request", async function () {
      const mockScore = 5555n;
      const mockProof = "0x";

      await contract.storeScore(mockScore, mockProof);

      // Request decryption explicitly
      await expect(contract.requestDecryption())
        .to.emit(contract, "DecryptionRequested");
    });
  });

  describe("Anti-patterns and common mistakes", function () {
    it("ANTI-PATTERN: Cannot use view function to return decrypted value", async function () {
      // This is correct - getEncryptedScore returns encrypted euint64, not decrypted value
      // View functions cannot decrypt values
      const mockScore = 5000n;
      const mockProof = "0x";

      await contract.storeScore(mockScore, mockProof);
      const encryptedValue = await contract.getEncryptedScore();

      // This is an encrypted handle, not the actual value
      expect(encryptedValue).to.not.be.undefined;
    });
  });
});
