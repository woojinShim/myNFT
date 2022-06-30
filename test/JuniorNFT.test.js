const chai = require("chai");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");

chai.use(solidity);

describe("JuniorNFT", function () {
  let JuniorNFT, contract, deployer, addr1, addr2;

  beforeEach(async () => {
    // DESTRUCTURING:
    [deployer, addr1, addr2] = await ethers.getSigners();
    JuniorNFT = await ethers.getContractFactory("JuniorNFT");
    contract = await JuniorNFT.deploy("http://baseURI", "http://defaultURI");
    await contract.deployed();
  });
  it("should set the right owner", async () => {
    expect(await contract.owner()).to.equal(deployer.address);
  });

  it("should emit TransferEvent if transfer succeeded", async () => {
    expect(await contract.connect(deployer).transfer(addr1.address, 100))
      .to.emit(contract, "TransferEvent")
      .withArgs(deployer.address, addr1.address, 100);
  });

  it("should revert if sender does not have enough balance", async () => {
    await expect(
      contract.connect(addr2).transfer(addr1.address, 100)
    ).to.be.revertedWith("Not enough balance");
  });

  it("should send/receive right amount", async () => {
    await contract.connect(deployer).transfer(addr1.address, 10000);

    expect(await contract.balanceOf(addr1.address)).to.eq(10000);
    expect(await contract.balanceOf(deployer.address)).to.eq(90000);
  });

  describe("function test", () => {
    it("should function act", async () => {
      await contract.addAdmin(addr1.address);
      console.log(await contract.Admin());
      console.log(addr1.address);
    });

    it("should mint", async () => {
      await contract.addAdmin(addr1.address);
      await contract.connect(addr1).adminMint(3);
      console.log(await contract.tokenURI(2));
      console.log(await contract.setBaseURI("asdf"));
      console.log(await contract.withdraw());
    });
  });
});
