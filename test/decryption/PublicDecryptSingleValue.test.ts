import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * Test suite for PublicDecryptSingleValue contract
 *
 * @chapter decryption
 * @description Demonstrates public decryption mechanism for making encrypted values publicly visible
 */
describe("PublicDecryptSingleValue", function () {
  let contract: any;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    const Factory = await ethers.getContractFactory("PublicDecryptSingleValue");
    contract = await Factory.deploy();
    [owner, addr1] = await ethers.getSigners();
  });

  it("Should deploy successfully", async function () {
    expect(contract.address).to.not.be.undefined;
  });

  describe("Public decryption workflow", function () {
    it("Should store encrypted value", async function () {
      const mockValue = 1000n;
      const mockProof = "0x";

      await expect(
        contract.storeValue(mockValue, mockProof)
      ).to.emit(contract, "ValueStored");
    });

    it("Should request public decryption", async function () {
      const mockValue = 5000n;
      const mockProof = "0x";

      await contract.storeValue(mockValue, mockProof);

      await expect(contract.requestPublicDecryption())
        .to.emit(contract, "DecryptionRequested");
    });

    it("Should fulfill decryption and make value public", async function () {
      const mockValue = 2500n;
      const mockProof = "0x";
      const plainValue = 2500;

      await contract.storeValue(mockValue, mockProof);
      await contract.requestPublicDecryption();

      // Simulate KMS callback
      await expect(contract.fulfillDecryption(plainValue))
        .to.emit(contract, "ValueDecrypted")
        .withArgs(plainValue);

      const hasDecrypted = await contract.hasDecrypted();
      expect(hasDecrypted).to.equal(true);
    });

    it("Should retrieve decrypted public value", async function () {
      const mockValue = 3000n;
      const mockProof = "0x";
      const plainValue = 3000;

      await contract.storeValue(mockValue, mockProof);
      await contract.requestPublicDecryption();
      await contract.fulfillDecryption(plainValue);

      const decrypted = await contract.getDecryptedValue();
      expect(decrypted).to.equal(plainValue);
    });
  });

  describe("State management", function () {
    it("Should track decryption status", async function () {
      const mockValue = 1500n;
      const mockProof = "0x";

      let hasDecrypted = await contract.hasDecrypted();
      expect(hasDecrypted).to.equal(false);

      await contract.storeValue(mockValue, mockProof);
      hasDecrypted = await contract.hasDecrypted();
      expect(hasDecrypted).to.equal(false);

      await contract.requestPublicDecryption();
      await contract.fulfillDecryption(1500);

      hasDecrypted = await contract.hasDecrypted();
      expect(hasDecrypted).to.equal(true);
    });

    it("Should reset decryption status when new value is stored", async function () {
      const mockValue1 = 1000n;
      const mockValue2 = 2000n;
      const mockProof = "0x";

      await contract.storeValue(mockValue1, mockProof);
      await contract.requestPublicDecryption();
      await contract.fulfillDecryption(1000);

      let hasDecrypted = await contract.hasDecrypted();
      expect(hasDecrypted).to.equal(true);

      // Store new value should reset status
      await contract.storeValue(mockValue2, mockProof);

      hasDecrypted = await contract.hasDecrypted();
      expect(hasDecrypted).to.equal(false);
    });
  });

  describe("Key concepts", function () {
    it("Demonstrates encrypted to public workflow", async function () {
      const mockValue = 7777n;
      const mockProof = "0x";

      // Step 1: Store encrypted value
      await contract.storeValue(mockValue, mockProof);

      // Step 2: Request decryption
      const requestId = await contract.requestPublicDecryption();
      expect(requestId).to.not.be.undefined;

      // Step 3: KMS fulfills decryption
      await contract.fulfillDecryption(7777);

      // Step 4: Value is now publicly readable
      const publicValue = await contract.getDecryptedValue();
      expect(publicValue).to.equal(7777);
    });

    it("Shows difference between encrypted handle and decrypted value", async function () {
      const mockValue = 5555n;
      const mockProof = "0x";

      await contract.storeValue(mockValue, mockProof);

      // Encrypted handle (euint32)
      const encryptedHandle = await contract.getEncryptedValue();
      expect(encryptedHandle).to.not.be.undefined;
      expect(typeof encryptedHandle).to.equal("object");

      // After decryption - plain uint32
      await contract.requestPublicDecryption();
      await contract.fulfillDecryption(5555);

      const plainValue = await contract.getDecryptedValue();
      expect(plainValue).to.equal(5555);
      expect(typeof plainValue).to.equal("bigint");
    });

    it("Demonstrates requestId generation", async function () {
      const mockValue = 9999n;
      const mockProof = "0x";

      await contract.storeValue(mockValue, mockProof);

      // Request returns a unique ID
      const requestId1 = await contract.requestPublicDecryption();
      expect(requestId1).to.not.be.undefined;
    });
  });

  describe("Error handling", function () {
    it("Should revert when requesting decryption of uninitialized value", async function () {
      await expect(contract.requestPublicDecryption())
        .to.be.revertedWith("Value not initialized");
    });

    it("Should revert when getting decrypted value before decryption", async function () {
      const mockValue = 1000n;
      const mockProof = "0x";

      await contract.storeValue(mockValue, mockProof);

      await expect(contract.getDecryptedValue())
        .to.be.revertedWith("Value not yet decrypted");
    });
  });

  describe("Public vs User decryption", function () {
    it("PUBLIC: Anyone can read decrypted value", async function () {
      const mockValue = 4444n;
      const mockProof = "0x";

      await contract.storeValue(mockValue, mockProof);
      await contract.requestPublicDecryption();
      await contract.fulfillDecryption(4444);

      // Owner can read
      const value1 = await contract.getDecryptedValue();
      expect(value1).to.equal(4444);

      // Anyone else can also read (public)
      const value2 = await contract.connect(addr1).getDecryptedValue();
      expect(value2).to.equal(4444);
    });

    it("Shows that public decryption is a two-step process", async function () {
      const mockValue = 8888n;
      const mockProof = "0x";

      // Step 1: Store encrypted
      await contract.storeValue(mockValue, mockProof);

      // Cannot read yet
      await expect(contract.getDecryptedValue())
        .to.be.revertedWith("Value not yet decrypted");

      // Step 2: Request decryption
      await contract.requestPublicDecryption();

      // Still cannot read (waiting for KMS)
      await expect(contract.getDecryptedValue())
        .to.be.revertedWith("Value not yet decrypted");

      // Step 3: KMS fulfills
      await contract.fulfillDecryption(8888);

      // Now publicly readable
      const value = await contract.getDecryptedValue();
      expect(value).to.equal(8888);
    });
  });

  describe("Anti-patterns", function () {
    it("ANTI-PATTERN: Must wait for KMS to fulfill decryption", async function () {
      const mockValue = 3333n;
      const mockProof = "0x";

      await contract.storeValue(mockValue, mockProof);
      await contract.requestPublicDecryption();

      // ANTI-PATTERN: Cannot read immediately after requesting
      // Must wait for KMS callback
      await expect(contract.getDecryptedValue())
        .to.be.revertedWith("Value not yet decrypted");

      // Correct: Wait for fulfillment
      await contract.fulfillDecryption(3333);
      const value = await contract.getDecryptedValue();
      expect(value).to.equal(3333);
    });
  });
});
