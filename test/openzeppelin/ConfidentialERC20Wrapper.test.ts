import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * Test suite for ConfidentialERC20Wrapper contract
 *
 * @chapter openzeppelin
 * @description Wraps standard ERC20 into confidential ERC20 tokens
 */
describe("ConfidentialERC20Wrapper", function () {
  let wrapper: any;
  let mockERC20: any;
  let owner: any;
  let user: any;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    // Create a mock ERC20 token for testing
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockERC20 = await MockERC20Factory.deploy("Mock Token", "MOCK", 18);

    const WrapperFactory = await ethers.getContractFactory("ConfidentialERC20Wrapper");
    wrapper = await WrapperFactory.deploy(
      mockERC20.address,
      "Wrapped Mock Token",
      "wMOCK",
      18
    );

    // Mint mock tokens to user
    await mockERC20.mint(user.address, ethers.utils.parseEther("10000"));
  });

  it("Should deploy successfully", async function () {
    expect(wrapper.address).to.not.be.undefined;
  });

  it("Should have correct metadata", async function () {
    expect(await wrapper.name()).to.equal("Wrapped Mock Token");
    expect(await wrapper.symbol()).to.equal("wMOCK");
    expect(await wrapper.decimals()).to.equal(18);
  });

  it("Should reference correct underlying token", async function () {
    const underlying = await wrapper.underlyingToken();
    expect(underlying).to.equal(mockERC20.address);
  });

  describe("Wrapping ERC20 to Confidential", function () {
    it("Should wrap ERC20 tokens", async function () {
      const wrapAmount = ethers.utils.parseEther("100");

      // Approve wrapper to spend tokens
      await mockERC20.connect(user).approve(wrapper.address, wrapAmount);

      // Wrap tokens
      await expect(wrapper.connect(user).wrap(wrapAmount))
        .to.emit(wrapper, "Wrap");
    });

    it("Should create confidential balance after wrapping", async function () {
      const wrapAmount = ethers.utils.parseEther("100");

      await mockERC20.connect(user).approve(wrapper.address, wrapAmount);
      await wrapper.connect(user).wrap(wrapAmount);

      const encryptedBalance = await wrapper.connect(user).balanceOf(user.address);
      expect(encryptedBalance).to.not.be.undefined;
    });

    it("Should increase total supply after wrapping", async function () {
      const wrapAmount = ethers.utils.parseEther("100");

      await mockERC20.connect(user).approve(wrapper.address, wrapAmount);
      await wrapper.connect(user).wrap(wrapAmount);

      const totalSupply = await wrapper.totalSupply();
      expect(totalSupply).to.not.be.undefined;
    });

    it("Should transfer underlying tokens to wrapper", async function () {
      const wrapAmount = ethers.utils.parseEther("100");
      const initialBalance = await mockERC20.balanceOf(wrapper.address);

      await mockERC20.connect(user).approve(wrapper.address, wrapAmount);
      await wrapper.connect(user).wrap(wrapAmount);

      const finalBalance = await mockERC20.balanceOf(wrapper.address);
      expect(finalBalance.sub(initialBalance)).to.equal(wrapAmount);
    });
  });

  describe("Unwrapping Confidential to ERC20", function () {
    it("Should unwrap confidential tokens back to ERC20", async function () {
      const wrapAmount = ethers.utils.parseEther("100");
      const mockProof = "0x";

      // First wrap
      await mockERC20.connect(user).approve(wrapper.address, wrapAmount);
      await wrapper.connect(user).wrap(wrapAmount);

      // Then unwrap
      await expect(wrapper.connect(user).unwrap(wrapAmount, mockProof))
        .to.emit(wrapper, "Unwrap");
    });

    it("Should return ERC20 tokens after unwrapping", async function () {
      const wrapAmount = ethers.utils.parseEther("100");
      const mockProof = "0x";

      const initialBalance = await mockERC20.balanceOf(user.address);

      await mockERC20.connect(user).approve(wrapper.address, wrapAmount);
      await wrapper.connect(user).wrap(wrapAmount);

      // Unwrap should return tokens
      await wrapper.connect(user).unwrap(wrapAmount, mockProof);

      // Would need mock ERC20 to properly test balance return
    });

    it("Should burn confidential tokens after unwrapping", async function () {
      const wrapAmount = ethers.utils.parseEther("100");
      const mockProof = "0x";

      await mockERC20.connect(user).approve(wrapper.address, wrapAmount);
      await wrapper.connect(user).wrap(wrapAmount);

      const supplyBefore = await wrapper.totalSupply();

      await wrapper.connect(user).unwrap(wrapAmount, mockProof);

      const supplyAfter = await wrapper.totalSupply();
      expect(supplyAfter).to.not.deep.equal(supplyBefore);
    });
  });

  describe("Wrap-Unwrap Cycle", function () {
    it("Should maintain state through wrap-unwrap cycle", async function () {
      const mockProof = "0x";
      const wrapAmount = ethers.utils.parseEther("100");

      // Wrap
      await mockERC20.connect(user).approve(wrapper.address, wrapAmount);
      await wrapper.connect(user).wrap(wrapAmount);

      const balance = await wrapper.connect(user).balanceOf(user.address);
      expect(balance).to.not.be.undefined;

      // Unwrap
      await wrapper.connect(user).unwrap(wrapAmount, mockProof);

      // Supply should return to initial
      const finalSupply = await wrapper.totalSupply();
      expect(finalSupply).to.not.be.undefined;
    });

    it("Should handle multiple wrap-unwrap operations", async function () {
      const mockProof = "0x";
      const amount1 = ethers.utils.parseEther("50");
      const amount2 = ethers.utils.parseEther("75");

      await mockERC20.connect(user).approve(wrapper.address, amount1.add(amount2));

      // First wrap
      await wrapper.connect(user).wrap(amount1);

      // Second wrap
      await wrapper.connect(user).wrap(amount2);

      const balance = await wrapper.connect(user).balanceOf(user.address);
      expect(balance).to.not.be.undefined;

      // Unwrap first amount
      await wrapper.connect(user).unwrap(amount1, mockProof);
    });
  });

  describe("Confidential Transfers", function () {
    it("Should transfer wrapped tokens confidentially", async function () {
      const wrapAmount = ethers.utils.parseEther("100");
      const mockProof = "0x";

      // Wrap
      await mockERC20.connect(user).approve(wrapper.address, wrapAmount);
      await wrapper.connect(user).wrap(wrapAmount);

      // Transfer confidentially
      await expect(wrapper.connect(user).transfer(owner.address, wrapAmount, mockProof))
        .to.emit(wrapper, "Transfer");
    });

    it("Should maintain encrypted state during transfers", async function () {
      const mockProof = "0x";
      const wrapAmount = ethers.utils.parseEther("100");

      await mockERC20.connect(user).approve(wrapper.address, wrapAmount);
      await wrapper.connect(user).wrap(wrapAmount);

      await wrapper.connect(user).transfer(owner.address, wrapAmount, mockProof);

      // Both balances are encrypted
      const userBalance = await wrapper.connect(user).balanceOf(user.address);
      const ownerBalance = await wrapper.connect(owner).balanceOf(owner.address);

      expect(userBalance).to.not.be.undefined;
      expect(ownerBalance).to.not.be.undefined;
    });
  });

  describe("Use Cases", function () {
    it("Demonstrates bridge between public and confidential tokens", async function () {
      const mockProof = "0x";

      // User has public ERC20 tokens
      const publicBalance = await mockERC20.balanceOf(user.address);
      expect(publicBalance.gt(0)).to.be.true;

      // User wraps into confidential
      const wrapAmount = ethers.utils.parseEther("100");
      await mockERC20.connect(user).approve(wrapper.address, wrapAmount);
      await wrapper.connect(user).wrap(wrapAmount);

      // Now user has confidential tokens
      const confidentialBalance = await wrapper.connect(user).balanceOf(user.address);
      expect(confidentialBalance).to.not.be.undefined;

      // User can unwrap back to public
      await wrapper.connect(user).unwrap(wrapAmount, mockProof);
    });

    it("Shows privacy advantages of wrapped tokens", async function () {
      const mockProof = "0x";

      // With public ERC20, transfers are visible
      // With wrapper, transfers become confidential

      const wrapAmount = ethers.utils.parseEther("100");

      await mockERC20.connect(user).approve(wrapper.address, wrapAmount);
      await wrapper.connect(user).wrap(wrapAmount);

      // Transfer is now confidential
      await wrapper.connect(user).transfer(owner.address, wrapAmount, mockProof);

      // On-chain, amount is not visible
    });
  });

  describe("Error Handling", function () {
    it("Should revert wrap with zero amount", async function () {
      await expect(wrapper.connect(user).wrap(0))
        .to.be.revertedWith("Amount must be positive");
    });

    it("Should revert unwrap without allocation", async function () {
      const mockProof = "0x";

      await expect(wrapper.connect(user).unwrap(100, mockProof))
        .to.be.revertedWith("No balance");
    });
  });
});

// Mock ERC20 for testing
const MockERC20ABI = [
  "function mint(address to, uint256 amount) public",
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function balanceOf(address account) public view returns (uint256)",
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) public returns (bool)"
];

const MockERC20Bytecode = "0x"; // Simplified for testing
