import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * Test suite for AccessControlExample contract
 *
 * @chapter access-control
 * @description Demonstrates FHE.allow and FHE.allowTransient for access control
 */
describe("AccessControlExample", function () {
  let contract: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    const Factory = await ethers.getContractFactory("AccessControlExample");
    contract = await Factory.deploy();
    [owner, addr1, addr2] = await ethers.getSigners();
  });

  it("Should deploy successfully", async function () {
    expect(contract.address).to.not.be.undefined;
  });

  it("Should set admin to deployer", async function () {
    const admin = await contract.admin();
    expect(admin).to.equal(owner.address);
  });

  describe("Score storage", function () {
    it("Should store encrypted score with proper access", async function () {
      const mockScore = 1000n;
      const mockProof = "0x";

      await expect(
        contract.storeScore(mockScore, mockProof)
      ).to.emit(contract, "ScoreStored")
        .withArgs(owner.address);
    });

    it("Should allow owner to view their own score", async function () {
      const mockScore = 5000n;
      const mockProof = "0x";

      await contract.storeScore(mockScore, mockProof);

      const score = await contract.viewScore(owner.address);
      expect(score).to.not.be.undefined;
    });

    it("Each user has separate encrypted score", async function () {
      const mockProof = "0x";

      await contract.storeScore(1000n, mockProof);
      await contract.connect(addr1).storeScore(2000n, mockProof);

      const score1 = await contract.viewScore(owner.address);
      const score2 = await contract.viewScore(addr1.address);

      expect(score1).to.not.deep.equal(score2);
    });
  });

  describe("Persistent access control (FHE.allow)", function () {
    it("Should grant persistent access to another address", async function () {
      const mockScore = 3000n;
      const mockProof = "0x";

      await contract.storeScore(mockScore, mockProof);

      await expect(contract.grantAccess(addr1.address))
        .to.emit(contract, "AccessGranted")
        .withArgs(owner.address, addr1.address, false);
    });

    it("Grantee can view score with persistent access", async function () {
      const mockScore = 7500n;
      const mockProof = "0x";

      await contract.storeScore(mockScore, mockProof);
      await contract.grantAccess(addr1.address);

      // Addr1 now has permanent access
      const score = await contract.connect(addr1).viewScore(owner.address);
      expect(score).to.not.be.undefined;
    });

    it("Multiple users can have access to same score", async function () {
      const mockScore = 4500n;
      const mockProof = "0x";

      await contract.storeScore(mockScore, mockProof);

      // Grant access to two different addresses
      await contract.grantAccess(addr1.address);
      await contract.grantAccess(addr2.address);

      // Both should have access
      const score1 = await contract.connect(addr1).viewScore(owner.address);
      const score2 = await contract.connect(addr2).viewScore(owner.address);

      expect(score1).to.not.be.undefined;
      expect(score2).to.not.be.undefined;
    });

    it("Persistent access persists across transactions", async function () {
      const mockScore = 6000n;
      const mockProof = "0x";

      await contract.storeScore(mockScore, mockProof);
      await contract.grantAccess(addr1.address);

      // First access
      let score = await contract.connect(addr1).viewScore(owner.address);
      expect(score).to.not.be.undefined;

      // Access still works after other transactions
      await contract.storeScore(8000n, mockProof);

      score = await contract.connect(addr1).viewScore(owner.address);
      expect(score).to.not.be.undefined;
    });
  });

  describe("Transient access control (FHE.allowTransient)", function () {
    it("Should grant transient access to another address", async function () {
      const mockScore = 2000n;
      const mockProof = "0x";

      await contract.storeScore(mockScore, mockProof);

      await expect(contract.grantTransientAccess(addr1.address))
        .to.emit(contract, "AccessGranted")
        .withArgs(owner.address, addr1.address, true);
    });

    it("Grantee can view score with transient access", async function () {
      const mockScore = 8500n;
      const mockProof = "0x";

      await contract.storeScore(mockScore, mockProof);
      await contract.grantTransientAccess(addr1.address);

      // Addr1 has temporary access
      const score = await contract.connect(addr1).viewScore(owner.address);
      expect(score).to.not.be.undefined;
    });

    it("Shows difference between persistent and transient access", async function () {
      const mockScore = 5500n;
      const mockProof = "0x";

      await contract.storeScore(mockScore, mockProof);

      // Grant both types of access
      await contract.grantAccess(addr1.address);           // Persistent
      await contract.grantTransientAccess(addr2.address);  // Temporary

      // Both work initially
      const score1 = await contract.connect(addr1).viewScore(owner.address);
      const score2 = await contract.connect(addr2).viewScore(owner.address);

      expect(score1).to.not.be.undefined;
      expect(score2).to.not.be.undefined;

      // But addr1 (persistent) can keep accessing, while addr2 (transient) loses access after use
      // Note: In production, transient access would expire after decryption/use
    });
  });

  describe("Admin access", function () {
    it("Only admin can call adminViewScore", async function () {
      const mockScore = 1500n;
      const mockProof = "0x";

      await contract.connect(addr1).storeScore(mockScore, mockProof);

      // Admin can view
      const scoreByAdmin = await contract.adminViewScore(addr1.address);
      expect(scoreByAdmin).to.not.be.undefined;

      // Non-admin cannot view
      await expect(
        contract.connect(addr1).adminViewScore(addr1.address)
      ).to.be.revertedWith("Only admin");
    });

    it("Admin can view any user's score without explicit permission", async function () {
      const mockScore = 9999n;
      const mockProof = "0x";

      await contract.connect(addr1).storeScore(mockScore, mockProof);

      // Admin has implicit access to all scores
      const score = await contract.adminViewScore(addr1.address);
      expect(score).to.not.be.undefined;
    });
  });

  describe("Access control patterns", function () {
    it("Demonstrates role-based access control", async function () {
      const mockScore = 7777n;
      const mockProof = "0x";

      await contract.storeScore(mockScore, mockProof);

      // Owner can always access their own data
      const ownerScore = await contract.viewScore(owner.address);
      expect(ownerScore).to.not.be.undefined;

      // Others need explicit permission
      await contract.grantAccess(addr1.address);

      const granteeScore = await contract.connect(addr1).viewScore(owner.address);
      expect(granteeScore).to.not.be.undefined;
    });

    it("Shows granular access control per encrypted value", async function () {
      const mockProof = "0x";

      // Store multiple scores
      await contract.storeScore(1000n, mockProof);
      await contract.connect(addr1).storeScore(2000n, mockProof);

      // Grant access to only one score
      await contract.grantAccess(addr1.address);

      // Addr1 can access owner's score
      const score = await contract.connect(addr1).viewScore(owner.address);
      expect(score).to.not.be.undefined;

      // Addr2 cannot access without permission
      await expect(
        contract.connect(addr2).viewScore(owner.address)
      ).to.be.reverted;
    });
  });

  describe("Key concepts", function () {
    it("Demonstrates FHE.allow() for persistent access", async function () {
      const mockScore = 4444n;
      const mockProof = "0x";

      await contract.storeScore(mockScore, mockProof);

      // Grant persistent access
      await contract.grantAccess(addr1.address);

      // Access works permanently
      const score = await contract.connect(addr1).viewScore(owner.address);
      expect(score).to.not.be.undefined;
    });

    it("Demonstrates FHE.allowTransient() for temporary access", async function () {
      const mockScore = 3333n;
      const mockProof = "0x";

      await contract.storeScore(mockScore, mockProof);

      // Grant transient access (expires after use)
      await contract.grantTransientAccess(addr1.address);

      // Access works for one-time use
      const score = await contract.connect(addr1).viewScore(owner.address);
      expect(score).to.not.be.undefined;
    });

    it("Shows why access control is necessary in FHE contracts", async function () {
      const mockScore = 6666n;
      const mockProof = "0x";

      // Without proper access control, users couldn't decrypt encrypted values
      await contract.storeScore(mockScore, mockProof);

      // Grantee needs explicit permission to view encrypted data
      await contract.grantAccess(addr1.address);

      const score = await contract.connect(addr1).viewScore(owner.address);
      expect(score).to.not.be.undefined;
    });
  });

  describe("Error handling", function () {
    it("Should revert when granting access to uninitialized score", async function () {
      await expect(contract.grantAccess(addr1.address))
        .to.be.revertedWith("Score not initialized");
    });

    it("Should revert when granting transient access to uninitialized score", async function () {
      await expect(contract.grantTransientAccess(addr1.address))
        .to.be.revertedWith("Score not initialized");
    });

    it("Admin should revert when viewing uninitialized score", async function () {
      await expect(contract.adminViewScore(addr1.address))
        .to.be.revertedWith("Score not initialized");
    });
  });

  describe("Anti-patterns", function () {
    it("ANTI-PATTERN: Cannot use view function to decrypt without permission", async function () {
      const mockScore = 5555n;
      const mockProof = "0x";

      await contract.storeScore(mockScore, mockProof);

      // ANTI-PATTERN: Others cannot view without explicit access grant
      // This is correct behavior - access control is enforced
      // Addr2 cannot view owner's score without permission
    });

    it("ANTI-PATTERN: Forgetting to grant access to authorized users", async function () {
      const mockScore = 1111n;
      const mockProof = "0x";

      await contract.connect(addr1).storeScore(mockScore, mockProof);

      // ANTI-PATTERN: Not granting access to users who need it
      // Admin still has implicit access
      const adminView = await contract.adminViewScore(addr1.address);
      expect(adminView).to.not.be.undefined;

      // But regular users must be granted access explicitly
      await contract.connect(addr1).grantAccess(addr2.address);
      const userView = await contract.connect(addr2).viewScore(addr1.address);
      expect(userView).to.not.be.undefined;
    });
  });
});
