const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("JuniorNFT", function () {
  let JuniorNFT, contract, addr;

  beforeEach(async () => {
    [...addr] = await ethers.getSigners();
    JuniorNFT = await ethers.getContractFactory("JuniorNFT");
    contract = await JuniorNFT.deploy("http://baseURI", "http://defaultURI");
    await contract.deployed();
  });
  describe("function test", () => {
    it("should function act", async () => {
      await contract.addAdmin(addr[1].address);
      console.log(await contract.Admin());
      console.log(addr[1].address);
    });

    it("should mint", async () => {
      await contract.addAdmin(addr[1].address);
      await contract.connect(addr[1]).adminMint(3);
      console.log(await contract.tokenURI(1));
    });
  });
});
