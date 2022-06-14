const { ethers } = require("hardhat");

async function main() {
  const JuniorNFT = await ethers.getContractFactory("JuniorNFT");
  const nft = await JuniorNFT.deploy();
  await nft.deployed();

  console.log("JuniorNFT deployed to:", nft.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
