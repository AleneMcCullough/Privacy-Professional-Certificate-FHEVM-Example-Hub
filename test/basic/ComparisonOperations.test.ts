import { expect } from "chai";
import { ethers } from "hardhat";

describe("ComparisonOperations", function () {
  let comparison: any;
  let owner: any;

  beforeEach(async function () {
    const ComparisonFactory = await ethers.getContractFactory("ComparisonOperations");
    comparison = await ComparisonFactory.deploy();
    [owner] = await ethers.getSigners();
  });

  it("Should deploy successfully", async function () {
    expect(comparison.address).to.not.be.undefined;
  });

  it("Should perform equal comparison", async function () {
    const a = 100n;
    const b = 100n;
    await expect(comparison.isEqual(a, b))
      .to.emit(comparison, "ComparisonPerformed")
      .withArgs("equal", owner.address);
  });

  it("Should perform less than comparison", async function () {
    const a = 50n;
    const b = 100n;
    await expect(comparison.isLessThan(a, b))
      .to.emit(comparison, "ComparisonPerformed")
      .withArgs("lessThan", owner.address);
  });

  it("Should perform less than or equal comparison", async function () {
    const a = 100n;
    const b = 100n;
    await expect(comparison.isLessThanOrEqual(a, b))
      .to.emit(comparison, "ComparisonPerformed")
      .withArgs("lessThanOrEqual", owner.address);
  });

  it("Should perform greater than comparison", async function () {
    const a = 150n;
    const b = 100n;
    await expect(comparison.isGreaterThan(a, b))
      .to.emit(comparison, "ComparisonPerformed")
      .withArgs("greaterThan", owner.address);
  });

  it("Should perform greater than or equal comparison", async function () {
    const a = 100n;
    const b = 100n;
    await expect(comparison.isGreaterThanOrEqual(a, b))
      .to.emit(comparison, "ComparisonPerformed")
      .withArgs("greaterThanOrEqual", owner.address);
  });
});
