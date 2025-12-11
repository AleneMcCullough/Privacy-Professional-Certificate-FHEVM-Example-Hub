import { expect } from "chai";
import { ethers } from "hardhat";

describe("FHECounter", function () {
  let counter: any;
  let owner: any;

  beforeEach(async function () {
    const CounterFactory = await ethers.getContractFactory("FHECounter");
    counter = await CounterFactory.deploy();
    [owner] = await ethers.getSigners();
  });

  it("Should deploy successfully", async function () {
    expect(counter.address).to.not.be.undefined;
  });

  it("Should increment counter", async function () {
    const value = 10n;
    await expect(counter.increment(value))
      .to.emit(counter, "CounterIncremented");
  });

  it("Should decrement counter", async function () {
    const value = 5n;
    await expect(counter.decrement(value))
      .to.emit(counter, "CounterDecremented");
  });
});
