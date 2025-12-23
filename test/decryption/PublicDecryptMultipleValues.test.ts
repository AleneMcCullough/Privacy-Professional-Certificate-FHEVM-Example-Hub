import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * Test suite for PublicDecryptMultipleValues contract
 *
 * @chapter decryption
 * @description Demonstrates public decryption of multiple encrypted values
 */
describe("PublicDecryptMultipleValues", function () {
  let contract: any;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    const Factory = await ethers.getContractFactory("PublicDecryptMultipleValues");
    contract = await Factory.deploy();
    [owner, addr1] = await ethers.getSigners();
  });

  it("Should deploy successfully", async function () {
    expect(contract.address).to.not.be.undefined;
  });

  describe("Multiple value public decryption", function () {
    it("Should store multiple encrypted values", async function () {
      const mockScore = 1000n;
      const mockLevel = 5n;
      const mockCategory = 2n;
      const mockProof = "0x";

      await expect(
        contract.storeData(
          mockScore, mockProof,
          mockLevel, mockProof,
          mockCategory, mockProof
        )
      ).to.emit(contract, "DataStored");
    });

    it("Should request public decryption of all values", async function () {
      const mockProof = "0x";

      await contract.storeData(
        5000n, mockProof,
        10n, mockProof,
        3n, mockProof
      );

      await expect(contract.requestPublicDecryption())
        .to.emit(contract, "DecryptionRequested");
    });

    it("Should fulfill decryption and make all values public", async function () {
      const mockProof = "0x";

      await contract.storeData(
        7500n, mockProof,
        15n, mockProof,
        5n, mockProof
      );

      await contract.requestPublicDecryption();

      await expect(contract.fulfillDecryption(7500, 15, 5))
        .to.emit(contract, "DataDecrypted")
        .withArgs(7500, 15, 5);

      const hasDecrypted = await contract.hasDecrypted();
      expect(hasDecrypted).to.equal(true);
    });

    it("Should retrieve all decrypted public values", async function () {
      const mockProof = "0x";

      await contract.storeData(
        3000n, mockProof,
        8n, mockProof,
        1n, mockProof
      );

      await contract.requestPublicDecryption();
      await contract.fulfillDecryption(3000, 8, 1);

      const [score, level, category] = await contract.getDecryptedData();
      expect(score).to.equal(3000);
      expect(level).to.equal(8);
      expect(category).to.equal(1);
    });
  });

  describe("State management", function () {
    it("Should track decryption status for multiple values", async function () {
      const mockProof = "0x";

      let hasDecrypted = await contract.hasDecrypted();
      expect(hasDecrypted).to.equal(false);

      await contract.storeData(
        1500n, mockProof,
        3n, mockProof,
        1n, mockProof
      );

      hasDecrypted = await contract.hasDecrypted();
      expect(hasDecrypted).to.equal(false);

      await contract.requestPublicDecryption();
      await contract.fulfillDecryption(1500, 3, 1);

      hasDecrypted = await contract.hasDecrypted();
      expect(hasDecrypted).to.equal(true);
    });

    it("Should reset decryption status when new data is stored", async function () {
      const mockProof = "0x";

      await contract.storeData(1000n, mockProof, 5n, mockProof, 2n, mockProof);
      await contract.requestPublicDecryption();
      await contract.fulfillDecryption(1000, 5, 2);

      let hasDecrypted = await contract.hasDecrypted();
      expect(hasDecrypted).to.equal(true);

      // Store new data should reset status
      await contract.storeData(2000n, mockProof, 7n, mockProof, 3n, mockProof);

      hasDecrypted = await contract.hasDecrypted();
      expect(hasDecrypted).to.equal(false);
    });
  });

  describe("Key concepts", function () {
    it("Demonstrates batch encrypted to public workflow", async function () {
      const mockProof = "0x";

      // Step 1: Store encrypted values
      await contract.storeData(
        7777n, mockProof,
        12n, mockProof,
        4n, mockProof
      );

      // Step 2: Request decryption
      const requestId = await contract.requestPublicDecryption();
      expect(requestId).to.not.be.undefined;

      // Step 3: KMS fulfills decryption for all values
      await contract.fulfillDecryption(7777, 12, 4);

      // Step 4: All values are now publicly readable
      const [score, level, category] = await contract.getDecryptedData();
      expect(score).to.equal(7777);
      expect(level).to.equal(12);
      expect(category).to.equal(4);
    });

    it("Shows difference between encrypted handles and decrypted values", async function () {
      const mockProof = "0x";

      await contract.storeData(
        5555n, mockProof,
        9n, mockProof,
        2n, mockProof
      );

      // Encrypted handles (euint64, euint32, euint8)
      const [encScore, encLevel, encCategory] = await contract.getEncryptedData();
      expect(encScore).to.not.be.undefined;
      expect(encLevel).to.not.be.undefined;
      expect(encCategory).to.not.be.undefined;

      // After decryption - plain values
      await contract.requestPublicDecryption();
      await contract.fulfillDecryption(5555, 9, 2);

      const [score, level, category] = await contract.getDecryptedData();
      expect(score).to.equal(5555);
      expect(level).to.equal(9);
      expect(category).to.equal(2);
    });

    it("Demonstrates efficient batch decryption", async function () {
      const mockProof = "0x";

      await contract.storeData(
        9999n, mockProof,
        20n, mockProof,
        7n, mockProof
      );

      // Single request for all values (more efficient than individual)
      await contract.requestPublicDecryption();
      await contract.fulfillDecryption(9999, 20, 7);

      const [score, level, category] = await contract.getDecryptedData();
      expect(score).to.equal(9999);
      expect(level).to.equal(20);
      expect(category).to.equal(7);
    });
  });

  describe("Public accessibility", function () {
    it("PUBLIC: Anyone can read all decrypted values", async function () {
      const mockProof = "0x";

      await contract.storeData(
        4444n, mockProof,
        6n, mockProof,
        3n, mockProof
      );

      await contract.requestPublicDecryption();
      await contract.fulfillDecryption(4444, 6, 3);

      // Owner can read
      const [score1, level1, category1] = await contract.getDecryptedData();
      expect(score1).to.equal(4444);
      expect(level1).to.equal(6);
      expect(category1).to.equal(3);

      // Anyone else can also read (public)
      const [score2, level2, category2] = await contract.connect(addr1).getDecryptedData();
      expect(score2).to.equal(4444);
      expect(level2).to.equal(6);
      expect(category2).to.equal(3);
    });
  });

  describe("Error handling", function () {
    it("Should revert when requesting decryption of uninitialized data", async function () {
      await expect(contract.requestPublicDecryption())
        .to.be.revertedWith("Data not initialized");
    });

    it("Should revert when getting decrypted data before decryption", async function () {
      const mockProof = "0x";

      await contract.storeData(
        1000n, mockProof,
        5n, mockProof,
        2n, mockProof
      );

      await expect(contract.getDecryptedData())
        .to.be.revertedWith("Data not yet decrypted");
    });

    it("Should revert after request but before fulfillment", async function () {
      const mockProof = "0x";

      await contract.storeData(
        2000n, mockProof,
        7n, mockProof,
        4n, mockProof
      );

      await contract.requestPublicDecryption();

      // Cannot read until KMS fulfills
      await expect(contract.getDecryptedData())
        .to.be.revertedWith("Data not yet decrypted");
    });
  });

  describe("Complete workflow", function () {
    it("Shows full public decryption lifecycle", async function () {
      const mockProof = "0x";

      // Phase 1: Encrypted storage
      await contract.storeData(
        8888n, mockProof,
        16n, mockProof,
        6n, mockProof
      );

      // Cannot read yet
      await expect(contract.getDecryptedData())
        .to.be.revertedWith("Data not yet decrypted");

      // Phase 2: Request decryption
      await contract.requestPublicDecryption();

      // Still cannot read (waiting for KMS)
      await expect(contract.getDecryptedData())
        .to.be.revertedWith("Data not yet decrypted");

      // Phase 3: KMS fulfills
      await contract.fulfillDecryption(8888, 16, 6);

      // Phase 4: Now publicly readable by anyone
      const [score, level, category] = await contract.getDecryptedData();
      expect(score).to.equal(8888);
      expect(level).to.equal(16);
      expect(category).to.equal(6);

      // Verify public access
      const [scorePublic] = await contract.connect(addr1).getDecryptedData();
      expect(scorePublic).to.equal(8888);
    });
  });

  describe("Anti-patterns", function () {
    it("ANTI-PATTERN: Cannot read before KMS fulfillment", async function () {
      const mockProof = "0x";

      await contract.storeData(
        3333n, mockProof,
        11n, mockProof,
        5n, mockProof
      );

      await contract.requestPublicDecryption();

      // ANTI-PATTERN: Cannot read immediately after requesting
      await expect(contract.getDecryptedData())
        .to.be.revertedWith("Data not yet decrypted");

      // Correct: Wait for KMS callback
      await contract.fulfillDecryption(3333, 11, 5);
      const [score] = await contract.getDecryptedData();
      expect(score).to.equal(3333);
    });
  });
});
