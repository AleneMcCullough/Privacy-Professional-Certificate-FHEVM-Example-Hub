import { expect } from "chai";
import { ethers } from "hardhat";

describe("ArithmeticOperations", function () {
  let arithmetic: any;
  let owner: any;

  beforeEach(async function () {
    const ArithmeticFactory = await ethers.getContractFactory("ArithmeticOperations");
    arithmetic = await ArithmeticFactory.deploy();
    [owner] = await ethers.getSigners();
  });

  it("Should deploy successfully", async function () {
    expect(arithmetic.address).to.not.be.undefined;
  });

  it("Should add two values", async function () {
    const a = 100n;
    const b = 50n;
    await expect(arithmetic.add(a, b))
      .to.emit(arithmetic, "OperationPerformed")
      .withArgs("add", owner.address);
  });

  it("Should subtract two values", async function () {
    const a = 100n;
    const b = 30n;
    await expect(arithmetic.subtract(a, b))
      .to.emit(arithmetic, "OperationPerformed")
      .withArgs("subtract", owner.address);
  });

  it("Should multiply two values", async function () {
    const a = 10n;
    const b = 5n;
    await expect(arithmetic.multiply(a, b))
      .to.emit(arithmetic, "OperationPerformed")
      .withArgs("multiply", owner.address);
  });

  it("Should divide by plaintext", async function () {
    const encrypted = 100n;
    const plaintext = 2n;
    await expect(arithmetic.divideByPlaintext(encrypted, plaintext))
      .to.emit(arithmetic, "OperationPerformed")
      .withArgs("divide", owner.address);
  });

  it("Should revert division by zero", async function () {
    const encrypted = 100n;
    await expect(arithmetic.divideByPlaintext(encrypted, 0n))
      .to.be.revertedWith("Division by zero");
  });
});
