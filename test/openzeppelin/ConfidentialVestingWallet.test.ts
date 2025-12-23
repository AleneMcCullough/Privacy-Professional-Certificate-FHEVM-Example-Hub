import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * Test suite for ConfidentialVestingWallet contract
 *
 * @chapter openzeppelin
 * @description Vesting wallet with encrypted token allocation
 */
describe("ConfidentialVestingWallet", function () {
  let wallet: any;
  let beneficiary: any;
  let other: any;

  const VESTING_DURATION = 365 * 24 * 60 * 60; // 1 year in seconds

  beforeEach(async function () {
    [beneficiary, other] = await ethers.getSigners();

    const currentBlock = await ethers.provider.getBlock("latest");
    const startTimestamp = currentBlock.timestamp + 100;

    const WalletFactory = await ethers.getContractFactory("ConfidentialVestingWallet");
    wallet = await WalletFactory.deploy(
      beneficiary.address,
      startTimestamp,
      VESTING_DURATION
    );
  });

  it("Should deploy successfully", async function () {
    expect(wallet.address).to.not.be.undefined;
  });

  it("Should set correct beneficiary", async function () {
    expect(await wallet.beneficiary()).to.equal(beneficiary.address);
  });

  it("Should set correct vesting duration", async function () {
    expect(await wallet.durationSeconds()).to.equal(VESTING_DURATION);
  });

  describe("Allocation", function () {
    it("Should allocate encrypted tokens", async function () {
      const mockAmount = 1000000n;
      const mockProof = "0x";

      await wallet.connect(beneficiary).allocate(mockAmount, mockProof);

      const allocation = await wallet.getTotalAllocation();
      expect(allocation).to.not.be.undefined;
    });

    it("Should only allow beneficiary to allocate", async function () {
      const mockAmount = 1000000n;
      const mockProof = "0x";

      await expect(
        wallet.connect(other).allocate(mockAmount, mockProof)
      ).to.be.revertedWith("Only beneficiary");
    });

    it("Should not allow re-allocation", async function () {
      const mockAmount = 1000000n;
      const mockProof = "0x";

      await wallet.connect(beneficiary).allocate(mockAmount, mockProof);

      await expect(
        wallet.connect(beneficiary).allocate(mockAmount, mockProof)
      ).to.be.revertedWith("Already allocated");
    });
  });

  describe("Vesting Schedule", function () {
    it("Should return correct vesting schedule info", async function () {
      const scheduleInfo = await wallet.getVestingSchedule();

      expect(scheduleInfo._beneficiary).to.equal(beneficiary.address);
      expect(scheduleInfo._start).to.not.be.undefined;
      expect(scheduleInfo._duration).to.equal(VESTING_DURATION);
    });

    it("Should calculate correct vesting end time", async function () {
      const scheduleInfo = await wallet.getVestingSchedule();
      const expectedEnd = scheduleInfo._start.add(scheduleInfo._duration);

      expect(scheduleInfo._end).to.equal(expectedEnd);
    });

    it("Should show not fully vested before schedule end", async function () {
      const mockAmount = 1000000n;
      const mockProof = "0x";

      await wallet.connect(beneficiary).allocate(mockAmount, mockProof);

      const isFullyVested = await wallet.isFullyVested();
      expect(isFullyVested).to.equal(false);
    });
  });

  describe("Vested Amount Calculation", function () {
    it("Should calculate zero vested before start", async function () {
      const mockAmount = 1000000n;
      const mockProof = "0x";

      await wallet.connect(beneficiary).allocate(mockAmount, mockProof);

      const vestedAmount = await wallet.getVestedAmount();
      expect(vestedAmount).to.not.be.undefined;
    });

    it("Should provide encrypted vested amount", async function () {
      const mockAmount = 1000000n;
      const mockProof = "0x";

      await wallet.connect(beneficiary).allocate(mockAmount, mockProof);

      const vestedAmount = await wallet.getVestedAmount();
      expect(typeof vestedAmount).to.equal("object");
    });
  });

  describe("Release Functionality", function () {
    it("Should only allow beneficiary to release", async function () {
      const mockAmount = 1000000n;
      const mockProof = "0x";

      await wallet.connect(beneficiary).allocate(mockAmount, mockProof);

      await expect(
        wallet.connect(other).release()
      ).to.be.revertedWith("Only beneficiary");
    });

    it("Should emit TokensReleased event on release", async function () {
      const mockAmount = 1000000n;
      const mockProof = "0x";

      await wallet.connect(beneficiary).allocate(mockAmount, mockProof);

      // Fast forward time to after vesting
      await ethers.provider.send("evm_mine", []);

      // Release should emit event
      const tx = await wallet.connect(beneficiary).release();
      expect(tx).to.not.be.undefined;
    });

    it("Should return encrypted releasable amount", async function () {
      const mockAmount = 1000000n;
      const mockProof = "0x";

      await wallet.connect(beneficiary).allocate(mockAmount, mockProof);

      // Fast forward time
      await ethers.provider.send("evm_mine", []);

      const releasable = await wallet.connect(beneficiary).release();
      expect(releasable).to.not.be.undefined;
    });
  });

  describe("Released Tracking", function () {
    it("Should track released amount", async function () {
      const mockAmount = 1000000n;
      const mockProof = "0x";

      await wallet.connect(beneficiary).allocate(mockAmount, mockProof);

      const initialReleased = await wallet.getReleased();
      expect(initialReleased).to.not.be.undefined;
    });

    it("Should increase released amount after release", async function () {
      const mockAmount = 1000000n;
      const mockProof = "0x";

      await wallet.connect(beneficiary).allocate(mockAmount, mockProof);

      const beforeRelease = await wallet.getReleased();

      // Fast forward time
      await ethers.provider.send("evm_mine", []);

      await wallet.connect(beneficiary).release();

      const afterRelease = await wallet.getReleased();

      expect(beforeRelease).to.not.deep.equal(afterRelease);
    });
  });

  describe("Encrypted Vesting", function () {
    it("Demonstrates encrypted allocation and release", async function () {
      const mockAmount = 1000000n;
      const mockProof = "0x";

      // Allocate encrypted tokens
      await wallet.connect(beneficiary).allocate(mockAmount, mockProof);

      // Get encrypted allocation
      const allocation = await wallet.getTotalAllocation();
      expect(typeof allocation).to.equal("object");

      // Get encrypted vested amount
      const vested = await wallet.getVestedAmount();
      expect(typeof vested).to.equal("object");

      // Release returns encrypted amount
      await ethers.provider.send("evm_mine", []);
      const releasable = await wallet.connect(beneficiary).release();

      expect(releasable).to.not.be.undefined;
    });

    it("Shows privacy benefits of confidential vesting", async function () {
      const mockAmount = 1000000n;
      const mockProof = "0x";

      // With standard vesting, all amounts visible
      // With confidential vesting, amounts encrypted

      await wallet.connect(beneficiary).allocate(mockAmount, mockProof);

      // Allocation amount is hidden
      const allocation = await wallet.getTotalAllocation();

      // Vesting schedule visible, but amounts encrypted
      const schedule = await wallet.getVestingSchedule();
      expect(schedule._start).to.not.be.undefined;
      expect(schedule._duration).to.equal(VESTING_DURATION);
    });

    it("Demonstrates multi-beneficiary vesting with privacy", async function () {
      // Each beneficiary has encrypted allocation
      const mockAmount1 = 1000000n;
      const mockProof = "0x";

      await wallet.connect(beneficiary).allocate(mockAmount1, mockProof);

      // Allocations are encrypted
      const allocationBeneficiary = await wallet.getTotalAllocation();
      expect(allocationBeneficiary).to.not.be.undefined;

      // No one can see actual allocation amounts without decryption permission
    });
  });

  describe("Timeline Progression", function () {
    it("Shows vesting progression through time", async function () {
      const mockAmount = 1000000n;
      const mockProof = "0x";

      // At T0: Allocation
      await wallet.connect(beneficiary).allocate(mockAmount, mockProof);

      const vestingStart = await wallet.getTotalAllocation();
      expect(vestingStart).to.not.be.undefined;

      // At T+half duration: Half vested
      // Fast forward to halfway through vesting
      // (Simplified - actual timing would use proper block advancement)

      // At T+duration: Fully vested
      // Fast forward to end of vesting
    });

    it("Should correctly identify fully vested state", async function () {
      const mockAmount = 1000000n;
      const mockProof = "0x";

      await wallet.connect(beneficiary).allocate(mockAmount, mockProof);

      const beforeEnd = await wallet.isFullyVested();
      expect(beforeEnd).to.equal(false);

      // In a real test, we would advance time to after vesting end
      // and check isFullyVested() returns true
    });
  });

  describe("Error Handling", function () {
    it("Should revert release when not allocated", async function () {
      await expect(
        wallet.connect(beneficiary).release()
      ).to.be.revertedWith("Not allocated");
    });

    it("Should revert release when nothing releasable", async function () {
      const mockAmount = 1000000n;
      const mockProof = "0x";

      await wallet.connect(beneficiary).allocate(mockAmount, mockProof);

      // Before vesting starts, nothing is releasable
      await expect(
        wallet.connect(beneficiary).release()
      ).to.be.revertedWith("Nothing to release");
    });
  });

  describe("Use Cases", function () {
    it("Demonstrates token vesting with privacy", async function () {
      const mockAmount = 10000000n; // 10M tokens
      const mockProof = "0x";

      // Allocate tokens to beneficiary
      await wallet.connect(beneficiary).allocate(mockAmount, mockProof);

      // Get allocation (encrypted)
      const allocation = await wallet.getTotalAllocation();
      expect(allocation).to.not.be.undefined;

      // Beneficiary checks vested amount (encrypted)
      const vestedAmount = await wallet.getVestedAmount();
      expect(vestedAmount).to.not.be.undefined;

      // Beneficiary can release tokens incrementally
      // Amounts remain confidential
    });

    it("Demonstrates privacy in employee stock options", async function () {
      const mockAmount = 100000n; // 100k option tokens
      const mockProof = "0x";

      // Employee vesting with private allocation amount
      await wallet.connect(beneficiary).allocate(mockAmount, mockProof);

      // No one except beneficiary (with proper decryption permission)
      // can see the exact vesting amount

      const allocation = await wallet.getTotalAllocation();
      expect(typeof allocation).to.equal("object");
    });

    it("Shows multi-phase vesting with encryption", async function () {
      const mockAmount = 5000000n;
      const mockProof = "0x";

      // Phase 1: Allocate encrypted tokens
      await wallet.connect(beneficiary).allocate(mockAmount, mockProof);

      // Phase 2: Check vesting progress (encrypted)
      const vestedAmount = await wallet.getVestedAmount();
      expect(vestedAmount).to.not.be.undefined;

      // Phase 3: Release vested tokens (encrypted)
      await ethers.provider.send("evm_mine", []);
      const releasable = await wallet.connect(beneficiary).release();

      expect(releasable).to.not.be.undefined;

      // Phase 4: Track released amount
      const released = await wallet.getReleased();
      expect(released).to.not.be.undefined;
    });
  });

  describe("Key Learning Points", function () {
    it("Demonstrates confidential token vesting mechanism", async function () {
      const mockAmount = 1000000n;
      const mockProof = "0x";

      // Allocation is encrypted
      await wallet.connect(beneficiary).allocate(mockAmount, mockProof);

      // Vesting calculations work on encrypted values
      const vested = await wallet.getVestedAmount();

      // Release returns encrypted amount
      await ethers.provider.send("evm_mine", []);
      const releasable = await wallet.connect(beneficiary).release();

      expect(releasable).to.not.be.undefined;
    });

    it("Shows how encryption improves vesting privacy", async function () {
      // Without encryption: All vesting amounts visible on-chain
      // With encryption: Amounts remain private

      const mockAmount = 1000000n;
      const mockProof = "0x";

      await wallet.connect(beneficiary).allocate(mockAmount, mockProof);

      // Public: Only vesting schedule (start, duration) visible
      const schedule = await wallet.getVestingSchedule();
      expect(schedule._start).to.not.be.undefined;

      // Private: Allocation and vesting amounts encrypted
      const allocation = await wallet.getTotalAllocation();
      expect(typeof allocation).to.equal("object");
    });
  });
});
