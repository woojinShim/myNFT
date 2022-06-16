const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("JuniorNFT", function () {
  let addr;

  beforEach(async () => {
    [...addr] = ethers.getSingers();
    const JuniorNFT = await ethers.getContractFactory("JuniorNFT");
    const contract = await JuniorNFT.deploy(
      "http://baseURI",
      "http://defaultURI"
    );
    await contract.deployed();
  });
  describe("function test", () => {
    it("should function act", async () => {
      await contract.addAdmin(addr1.address);
      console.log(await contract.Admin);
    });
  });
});
