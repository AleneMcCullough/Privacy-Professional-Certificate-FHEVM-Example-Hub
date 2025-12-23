import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * Test suite for UserDecryptMultipleValues contract
 *
 * @chapter decryption
 * @description Demonstrates how users can decrypt multiple encrypted values of different types
 */
describe("UserDecryptMultipleValues", function () {
  let contract: any;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    const Factory = await ethers.getContractFactory("UserDecryptMultipleValues");
    contract = await Factory.deploy();
    [owner, addr1] = await ethers.getSigners();
  });

  it("Should deploy successfully", async function () {
    expect(contract.address).to.not.be.undefined;
  });

  describe("Multiple value decryption", function () {
    it("Should store multiple encrypted values", async function () {
      const mockScore = 1000n;
      const mockAchievements = 25n;
      const mockProof = "0x";

      await expect(
        contract.storeData(
          mockScore,
          mockProof,
          mockAchievements,
          mockProof
        )
      ).to.emit(contract, "DataStored");
    });

    it("Should request decryption of all values", async function () {
      const mockScore = 5000n;
      const mockAchievements = 30n;
      const mockProof = "0x";

      await contract.storeData(
        mockScore,
        mockProof,
        mockAchievements,
        mockProof
      );

      await expect(contract.requestDecryptionAll())
        .to.emit(contract, "MultipleDecryptionsRequested");
    });

    it("Should request decryption of score only", async function () {
      const mockScore = 7500n;
      const mockAchievements = 35n;
      const mockProof = "0x";

      await contract.storeData(
        mockScore,
        mockProof,
        mockAchievements,
        mockProof
      );

      const score = await contract.requestDecryptScore();
      expect(score).to.not.be.undefined;
    });

    it("Should request decryption of achievements only", async function () {
      const mockScore = 3000n;
      const mockAchievements = 15n;
      const mockProof = "0x";

      await contract.storeData(
        mockScore,
        mockProof,
        mockAchievements,
        mockProof
      );

      const achievements = await contract.requestDecryptAchievements();
      expect(achievements).to.not.be.undefined;
    });
  });

  describe("Access control for multiple values", function () {
    it("Should maintain separate encrypted data per user", async function () {
      const mockProof = "0x";

      // Owner sets data
      await contract.storeData(1000n, mockProof, 25n, mockProof);

      // Another user sets different data
      await contract.connect(addr1).storeData(2000n, mockProof, 30n, mockProof);

      // Request decryption for each user
      await expect(contract.requestDecryptionAll())
        .to.emit(contract, "MultipleDecryptionsRequested");

      await expect(contract.connect(addr1).requestDecryptionAll())
        .to.emit(contract, "MultipleDecryptionsRequested");
    });

    it("Should grant proper permissions for all values", async function () {
      const mockProof = "0x";

      await contract.storeData(3000n, mockProof, 28n, mockProof);

      // All values should be accessible by the owner
      const score = await contract.requestDecryptScore();
      const achievements = await contract.requestDecryptAchievements();

      expect(score).to.not.be.undefined;
      expect(achievements).to.not.be.undefined;
    });
  });

  describe("Key concepts", function () {
    it("Demonstrates handling multiple encrypted types", async function () {
      // euint64 for score, euint32 for achievements
      const mockScore = 999999n; // euint64
      const mockAchievements = 100n; // euint32
      const mockProof = "0x";

      await contract.storeData(
        mockScore,
        mockProof,
        mockAchievements,
        mockProof
      );

      const allData = await contract.requestDecryptionAll();
      expect(allData).to.not.be.undefined;
    });

    it("Shows efficient batch decryption of encrypted data", async function () {
      const mockProof = "0x";

      await contract.storeData(5000n, mockProof, 25n, mockProof);

      // More efficient to decrypt all at once
      await expect(contract.requestDecryptionAll())
        .to.emit(contract, "MultipleDecryptionsRequested");
    });

    it("Demonstrates input proof requirement for each value", async function () {
      // Each encrypted value requires its own input proof
      const mockProof = "0x";

      await expect(
        contract.storeData(
          1000n, mockProof,  // score + proof
          25n, mockProof     // achievements + proof
        )
      ).to.emit(contract, "DataStored");
    });

    it("Demonstrates selective decryption", async function () {
      const mockProof = "0x";

      await contract.storeData(2500n, mockProof, 22n, mockProof);

      // Can decrypt only score
      const score = await contract.requestDecryptScore();
      expect(score).to.not.be.undefined;

      // Or only achievements
      const achievements = await contract.requestDecryptAchievements();
      expect(achievements).to.not.be.undefined;
    });
  });

  describe("Decryption patterns", function () {
    it("Shows proper permission model for multi-value decryption", async function () {
      const mockProof = "0x";

      await contract.storeData(10000n, mockProof, 40n, mockProof);

      // requestDecryptionAll grants FHE.allow() for both values
      await expect(contract.requestDecryptionAll())
        .to.emit(contract, "MultipleDecryptionsRequested");
    });

    it("Demonstrates that decryption functions return encrypted handles", async function () {
      const mockProof = "0x";

      await contract.storeData(5000n, mockProof, 30n, mockProof);

      // These are encrypted handles that need client-side decryption
      const score = await contract.requestDecryptScore();
      const achievements = await contract.requestDecryptAchievements();

      expect(typeof score).to.equal("object");
      expect(typeof achievements).to.equal("object");
    });
  });

  describe("Error handling", function () {
    it("Should revert when requesting decryption of uninitialized score", async function () {
      await expect(contract.requestDecryptScore())
        .to.be.revertedWith("Score not initialized");
    });

    it("Should revert when requesting decryption of uninitialized achievements", async function () {
      await expect(contract.requestDecryptAchievements())
        .to.be.revertedWith("Achievements not initialized");
    });

    it("Should revert when requesting decryption of all uninitialized data", async function () {
      await expect(contract.requestDecryptionAll())
        .to.be.revertedWith("Score not initialized");
    });
  });

  describe("Anti-patterns", function () {
    it("ANTI-PATTERN: Must use decryption request functions", async function () {
      const mockProof = "0x";

      await contract.storeData(5000n, mockProof, 30n, mockProof);

      // Correct: Use request functions that grant FHE.allow() permission
      const score = await contract.requestDecryptScore();
      expect(score).to.not.be.undefined;

      // ANTI-PATTERN: Cannot decrypt without proper permission grants
      // View functions alone don't provide decryption permissions
    });
  });
});
