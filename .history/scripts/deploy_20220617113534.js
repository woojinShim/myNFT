const { ethers } = require("hardhat");

async function main() {
  const JuniorNFT = await ethers.getContractFactory("JuniorNFT");
  const contract = await JuniorNFT.deploy(
    "http://baseURI",
    "http://defaultURI"
  );
  await contract.deployed();

  console.log("JuniorNFT deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
