const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("JuniorNFT", function () {
  it("deploy", async function () {
    const JuniorNFT = await ethers.getContractFactory("JuniorNFT");
    const contract = await JuniorNFT.deploy(
      "http://baseURI",
      "http://defaultURI"
    );
    await contract.deployed();

    console.log("JuniorNFT deployed to:", contract.address);
  });
});
