const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TemplateContract", function () {
  let templateContract;
  let owner;

  beforeEach(async function () {
    const TemplateContractFactory = await ethers.getContractFactory("TemplateContract");
    templateContract = await TemplateContractFactory.deploy();
    await templateContract.deployed();

    [owner] = await ethers.getSigners();
  });

  it("Should deploy successfully", async function () {
    expect(templateContract.address).to.not.be.undefined;
  });

  it("Should set and get value", async function () {
    const value = 42n;
    await templateContract.setValue(value);
    const result = await templateContract.getValue();
    expect(result).to.not.be.undefined;
  });

  it("Should emit ValueUpdated event", async function () {
    const value = 42n;
    await expect(templateContract.setValue(value))
      .to.emit(templateContract, "ValueUpdated")
      .withArgs(owner.address);
  });
});
