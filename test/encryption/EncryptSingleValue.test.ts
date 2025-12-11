import { expect } from "chai";
import { ethers } from "hardhat";

describe("EncryptSingleValue", function () {
  let encrypt: any;
  let owner: any;

  beforeEach(async function () {
    const EncryptFactory = await ethers.getContractFactory("EncryptSingleValue");
    encrypt = await EncryptFactory.deploy();
    [owner] = await ethers.getSigners();
  });

  it("Should deploy successfully", async function () {
    expect(encrypt.address).to.not.be.undefined;
  });

  it("Should store encrypted value", async function () {
    const inputValue = 12345n;
    const inputProof = ethers.toBeHex(0);
    
    await expect(encrypt.storeEncryptedValue(inputValue, inputProof))
      .to.emit(encrypt, "ValueEncrypted");
  });

  it("Should retrieve encrypted value", async function () {
    const inputValue = 12345n;
    const inputProof = ethers.toBeHex(0);
    
    await encrypt.storeEncryptedValue(inputValue, inputProof);
    const retrieved = await encrypt.getEncryptedValue();
    expect(retrieved).to.not.be.undefined;
  });
});
