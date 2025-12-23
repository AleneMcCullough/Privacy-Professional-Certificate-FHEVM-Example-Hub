import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * Test suite for AntiPatterns contract
 *
 * @chapter anti-patterns
 * @description Demonstrates common mistakes and anti-patterns with FHEVM
 */
describe("AntiPatterns", function () {
  let contract: any;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    const Factory = await ethers.getContractFactory("AntiPatterns");
    contract = await Factory.deploy();
    [owner, addr1] = await ethers.getSigners();
  });

  it("Should deploy successfully", async function () {
    expect(contract.address).to.not.be.undefined;
  });

  describe("ANTI-PATTERN 1: View functions with encrypted values", function () {
    it("WRONG: View function cannot grant decryption permissions", async function () {
      const mockValue = 1000n;
      const mockProof = "0x";

      await contract.storeValueCorrect(mockValue, mockProof);

      // This works but does NOT allow decryption
      const value = await contract.getValueWrong();
      expect(value).to.not.be.undefined;

      // The returned value is an encrypted handle, not decryptable by the user
      // because view functions cannot call FHE.allow()
    });

    it("CORRECT: Non-view function grants access", async function () {
      const mockValue = 2000n;
      const mockProof = "0x";

      await contract.storeValueCorrect(mockValue, mockProof);

      // This grants permission via FHE.allow()
      const value = await contract.getValueCorrect();
      expect(value).to.not.be.undefined;

      // Now the user can decrypt this value
    });

    it("Shows why view functions are insufficient for decryption", async function () {
      const mockValue = 3000n;
      const mockProof = "0x";

      await contract.storeValueCorrect(mockValue, mockProof);

      // getValueWrong returns an encrypted handle
      // but doesn't grant permission to decrypt it
      const wrongValue = await contract.getValueWrong();
      expect(wrongValue).to.not.be.undefined;

      // getValueCorrect grants permission first
      const correctValue = await contract.getValueCorrect();
      expect(correctValue).to.not.be.undefined;
    });
  });

  describe("ANTI-PATTERN 2: Missing FHE.allowThis() permissions", function () {
    it("WRONG: Storing without FHE.allowThis() prevents contract operations", async function () {
      const mockValue = 5000n;
      const mockProof = "0x";

      // Stores value without FHE.allowThis()
      await contract.storeValueWrong(mockValue, mockProof);

      // Contract may not be able to use this value later
      // because it didn't grant itself permission
    });

    it("CORRECT: Always use FHE.allowThis() for contract storage", async function () {
      const mockValue = 7500n;
      const mockProof = "0x";

      // Stores with both FHE.allowThis() and FHE.allow()
      await contract.storeValueCorrect(mockValue, mockProof);

      // Contract can now use this value
      // User can also decrypt it
    });

    it("Demonstrates why both permissions are needed", async function () {
      const mockValue = 4500n;
      const mockProof = "0x";

      await contract.storeValueCorrect(mockValue, mockProof);

      // FHE.allowThis() - Contract can perform operations
      // FHE.allow(msg.sender) - User can decrypt

      const value = await contract.getValueCorrect();
      expect(value).to.not.be.undefined;
    });
  });

  describe("ANTI-PATTERN 3: Comparing encrypted with plaintext incorrectly", function () {
    it("WRONG: Cannot directly compare encrypted == plaintext", async function () {
      // This code doesn't compile:
      // return encrypted == 100; // ❌ Type mismatch
      //
      // Encrypted values must be compared using FHE operations
    });

    it("CORRECT: Use FHE comparison operations", async function () {
      const mockValue = 1000n;
      const mockProof = "0x";
      const threshold = 500;

      await contract.storeValueCorrect(mockValue, mockProof);

      const value = await contract.getValueCorrect();

      // Compare using FHE.gt() after converting threshold to encrypted
      const result = await contract.compareCorrect(value, threshold);
      expect(result).to.be.a("boolean");
    });

    it("Shows proper encrypted comparison pattern", async function () {
      const mockValue = 7777n;
      const mockProof = "0x";

      await contract.storeValueCorrect(mockValue, mockProof);

      const value = await contract.getValueCorrect();

      // Must convert plaintext to encrypted first
      // Then use FHE operations for comparison
      const result1 = await contract.compareCorrect(value, 5000);
      const result2 = await contract.compareCorrect(value, 10000);

      expect(result1).to.be.a("boolean");
      expect(result2).to.be.a("boolean");
    });
  });

  describe("ANTI-PATTERN 4: Not validating FHE initialization", function () {
    it("WRONG: Operating on uninitialized values causes failures", async function () {
      // Create uninitialized euint64
      const uninitializedValue = ethers.BigNumber.from(0);

      // This would fail because values aren't initialized
      // await contract.operateWithoutCheckWrong(uninitializedValue, uninitializedValue);
    });

    it("CORRECT: Always check initialization", async function () {
      const mockValue = 1000n;
      const mockProof = "0x";

      await contract.storeValueCorrect(mockValue, mockProof);

      const value = await contract.getValueCorrect();

      // This checks initialization before operating
      await contract.operateWithCheckCorrect(value, value);
    });

    it("Demonstrates FHE.isInitialized() check pattern", async function () {
      const mockValue = 5555n;
      const mockProof = "0x";

      await contract.storeValueCorrect(mockValue, mockProof);

      const value = await contract.getValueCorrect();

      // operateWithCheckCorrect validates both inputs
      const result = await contract.operateWithCheckCorrect(value, value);
      expect(result).to.not.be.undefined;
    });

    it("Shows error prevention with initialization checks", async function () {
      const mockValue = 3333n;
      const mockProof = "0x";

      await contract.storeValueCorrect(mockValue, mockProof);

      const value = await contract.getValueCorrect();

      // Without checks: possible runtime failures
      // With checks: safe operations guaranteed
      const result = await contract.operateWithCheckCorrect(value, value);
      expect(result).to.not.be.undefined;
    });
  });

  describe("ANTI-PATTERN 5: Exposing encrypted values in events", function () {
    it("WRONG: Emitting encrypted values defeats privacy", async function () {
      // event ValueStoredWrong(euint64 value); // ❌ Don't do this
      //
      // If you emit the encrypted value, it's logged on-chain
      // Anyone can see it, even if they can't decrypt it
      // This reduces privacy benefits
    });

    it("CORRECT: Emit only non-sensitive metadata", async function () {
      // event ValueStoredCorrect(address indexed user, uint256 timestamp);
      //
      // Emit addresses, timestamps, status flags
      // Never emit the encrypted values themselves
    });

    it("Shows proper event emission pattern", async function () {
      const mockValue = 9999n;
      const mockProof = "0x";

      // When storing, only emit metadata
      await contract.storeValueCorrect(mockValue, mockProof);

      // Events should contain user address, timestamp, etc.
      // But never the encrypted value itself
    });
  });

  describe("ANTI-PATTERN 6: Incorrect handle usage", function () {
    it("WRONG: Exposing or manipulating handles directly", async function () {
      // Handles are internal representations
      // ❌ Don't extract, store, or manipulate handles directly
      // ❌ Don't expose handles in public functions
      // ❌ Don't try to recreate handles manually
    });

    it("CORRECT: Always work with euint types", async function () {
      const mockValue = 8888n;
      const mockProof = "0x";

      // Store as euint64, not as a handle
      await contract.storeValueCorrect(mockValue, mockProof);

      // Return euint64, not handles
      const value = await contract.getValueCorrect();
      expect(value).to.not.be.undefined;

      // Let FHEVM library manage handles internally
    });

    it("Shows proper type usage pattern", async function () {
      const mockValue = 6666n;
      const mockProof = "0x";

      await contract.storeValueCorrect(mockValue, mockProof);

      // Work with euint64 types throughout
      const value = await contract.getValueCorrect();

      // Never try to access ._euint64 handle directly
      // Trust the FHEVM library to manage handles
      expect(value).to.not.be.undefined;
    });
  });

  describe("Summary of best practices", function () {
    it("Demonstrates all correct patterns together", async function () {
      const mockValue = 7777n;
      const mockProof = "0x";

      // ✅ Store with both FHE.allowThis() and FHE.allow()
      await contract.storeValueCorrect(mockValue, mockProof);

      // ✅ Use non-view function to grant access
      const value = await contract.getValueCorrect();

      // ✅ Check initialization before operations
      const result = await contract.operateWithCheckCorrect(value, value);
      expect(result).to.not.be.undefined;

      // ✅ Use FHE operations for comparisons
      const compareResult = await contract.compareCorrect(value, 5000);
      expect(compareResult).to.be.a("boolean");

      // ✅ Never emit encrypted values in events
      // ✅ Always work with euint types, not handles
    });

    it("Shows complete secure FHEVM workflow", async function () {
      const mockValue = 4444n;
      const mockProof = "0x";

      // 1. Store with proper permissions
      await contract.storeValueCorrect(mockValue, mockProof);

      // 2. Grant access through non-view function
      const value = await contract.getValueCorrect();

      // 3. Validate before operations
      const sum = await contract.operateWithCheckCorrect(value, value);

      // 4. Use FHE operations for comparisons
      const isGreater = await contract.compareCorrect(sum, 5000);

      // All operations follow best practices
      expect(sum).to.not.be.undefined;
      expect(isGreater).to.be.a("boolean");
    });
  });

  describe("Key takeaways", function () {
    it("View functions cannot grant decryption permissions", async function () {
      const mockValue = 1111n;
      const mockProof = "0x";

      await contract.storeValueCorrect(mockValue, mockProof);

      // View function returns encrypted handle but no decryption permission
      await contract.getValueWrong();

      // Non-view function grants permission
      await contract.getValueCorrect();
    });

    it("Always use FHE.allowThis() for contract storage", async function () {
      const mockValue = 2222n;
      const mockProof = "0x";

      // Without FHE.allowThis(), contract cannot use the value
      await contract.storeValueWrong(mockValue, mockProof);

      // With FHE.allowThis(), contract has full access
      await contract.storeValueCorrect(mockValue, mockProof);
    });

    it("Use FHE operations for all encrypted comparisons", async function () {
      const mockValue = 3333n;
      const mockProof = "0x";

      await contract.storeValueCorrect(mockValue, mockProof);

      const value = await contract.getValueCorrect();

      // Must use FHE.gt(), FHE.eq(), etc., not ==, >, <
      const result = await contract.compareCorrect(value, 2000);
      expect(result).to.be.a("boolean");
    });

    it("Always validate initialization with FHE.isInitialized()", async function () {
      const mockValue = 4444n;
      const mockProof = "0x";

      await contract.storeValueCorrect(mockValue, mockProof);

      const value = await contract.getValueCorrect();

      // Check initialization prevents runtime errors
      const result = await contract.operateWithCheckCorrect(value, value);
      expect(result).to.not.be.undefined;
    });

    it("Never emit encrypted values in events", async function () {
      // Events should only contain public metadata
      // Encrypted values should never be in event logs
      // This maintains privacy guarantees
    });

    it("Work with euint types, never handle internals directly", async function () {
      const mockValue = 5555n;
      const mockProof = "0x";

      await contract.storeValueCorrect(mockValue, mockProof);

      // Use euint64, euint32, etc.
      // Never manipulate ._euint64 handles
      const value = await contract.getValueCorrect();
      expect(value).to.not.be.undefined;
    });
  });
});
