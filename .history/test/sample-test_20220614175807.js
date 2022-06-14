const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const JuniorNFT = await ethers.getContractFactory("JuniorNFT");
    const nft = await JuniorNFT.deploy();
    await nft.deployed();

    console.log("JuniorNFT deployed to:", nft.address);
  });
});
