const { ethers } = require("hardhat");

async function main() {
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const contract = await MyNFT.deploy("http://baseURI", "http://defaultURI");
  await contract.deployed();

  console.log("MyNFT deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
