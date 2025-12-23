import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * Test suite for EncryptMultipleValues contract
 *
 * @chapter encryption
 * @description Demonstrates how to encrypt and store multiple values of different types using FHEVM
 */
describe("EncryptMultipleValues", function () {
  let contract: any;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    const Factory = await ethers.getContractFactory("EncryptMultipleValues");
    contract = await Factory.deploy();
    [owner, addr1] = await ethers.getSigners();
  });

  it("Should deploy successfully", async function () {
    expect(contract.address).to.not.be.undefined;
  });

  describe("Multiple value encryption", function () {
    it("Should store multiple encrypted values with proper types", async function () {
      // Note: In production, these would be proper encrypted inputs with proofs
      // For testing purposes, we demonstrate the function signature
      const mockScore = 1000n;
      const mockLevel = 5n;
      const mockCategory = 2n;

      const mockProof = "0x";

      await expect(
        contract.storeMultipleValues(
          mockScore,
          mockProof,
          mockLevel,
          mockProof,
          mockCategory,
          mockProof
        )
      ).to.emit(contract, "MultipleValuesEncrypted");
    });

    it("Should handle different encrypted types (euint64, euint32, euint8)", async function () {
      // This test demonstrates type handling
      const mockScore = 999999n; // euint64
      const mockLevel = 100n;     // euint32
      const mockCategory = 10n;   // euint8
      const mockProof = "0x";

      await contract.storeMultipleValues(
        mockScore,
        mockProof,
        mockLevel,
        mockProof,
        mockCategory,
        mockProof
      );

      // Verify we can retrieve the encrypted values
      const score = await contract.getEncryptedScore();
      const level = await contract.getEncryptedLevel();
      const category = await contract.getEncryptedCategory();

      expect(score).to.not.be.undefined;
      expect(level).to.not.be.undefined;
      expect(category).to.not.be.undefined;
    });

    it("Should retrieve all encrypted data at once", async function () {
      const mockScore = 5000n;
      const mockLevel = 3n;
      const mockCategory = 1n;
      const mockProof = "0x";

      await contract.storeMultipleValues(
        mockScore,
        mockProof,
        mockLevel,
        mockProof,
        mockCategory,
        mockProof
      );

      const allData = await contract.getAllEncryptedData();
      expect(allData).to.not.be.undefined;
      expect(allData.length).to.equal(3);
    });
  });

  describe("Access control", function () {
    it("Should store encrypted data per user", async function () {
      const mockScore1 = 1000n;
      const mockLevel1 = 5n;
      const mockCategory1 = 2n;
      const mockProof = "0x";

      await contract.storeMultipleValues(
        mockScore1,
        mockProof,
        mockLevel1,
        mockProof,
        mockCategory1,
        mockProof
      );

      const mockScore2 = 2000n;
      const mockLevel2 = 7n;
      const mockCategory2 = 3n;

      await contract.connect(addr1).storeMultipleValues(
        mockScore2,
        mockProof,
        mockLevel2,
        mockProof,
        mockCategory2,
        mockProof
      );

      // Each user should have their own encrypted data
      const ownerData = await contract.getAllEncryptedData();
      const addr1Data = await contract.connect(addr1).getAllEncryptedData();

      expect(ownerData).to.not.deep.equal(addr1Data);
    });
  });

  describe("Key concepts", function () {
    it("Demonstrates FHE.fromExternal() for multiple types", async function () {
      // This test shows how FHE.fromExternal() is used for each encrypted type
      const mockProof = "0x";

      await contract.storeMultipleValues(
        100n,   // euint64
        mockProof,
        50n,    // euint32
        mockProof,
        5n,     // euint8
        mockProof
      );

      expect(await contract.getEncryptedScore()).to.not.be.undefined;
    });

    it("Demonstrates proper permission granting for multiple values", async function () {
      // Shows that FHE.allowThis() and FHE.allow() must be called for each encrypted value
      const mockProof = "0x";

      await expect(
        contract.storeMultipleValues(
          1000n,
          mockProof,
          100n,
          mockProof,
          10n,
          mockProof
        )
      ).to.emit(contract, "MultipleValuesEncrypted");
    });
  });
});
