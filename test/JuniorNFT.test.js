const chai,{ expect } = require("chai");
const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");

chai.use(solidity);

describe("JuniorNFT", function () {
  let JuniorNFT, contract, deployer, addr1, addr2;

  beforeEach(async () => {
    [deployer, addr1, addr2] = await ethers.getSigners();
    JuniorNFT = await ethers.getContractFactory("JuniorNFT");
    // contract = await JuniorNFT.deploy("http://baseURI", "http://defaultURI");
    contract = await JuniorNFT.deploy();
    // await contract.deployed();
  });
  it('should set the right owner', async () => {
    expect(await contract.owner()).to.equal(deployer.address)
  })

  it('should emit TransferEvent if transfer succeeded', async () => {
    expect(await contract.connect(deployer).transfer(addr1.address, 100)).to.emit(token, "TransferEvent")
    .withArgs(deployer.address, addr1.address, 100)
  })

  it('should revert if sender does not have enough balance', async() => {
    await expect(token.connect(addr2).transfer(addr1.address, 100)).to.be.revertedWith("Not enough balance")
  })

  it('should send/receive right amount', async () => {
    await token.connect(deployer).transfer(addr1.address, 10000)

    expect(await token.balanceOf(addr1.address)).to.eq(10000)
    expect(await token.balanceOf(deployer.address)).to.eq(90000)
  })

  
  describe("function test", () => {
    it("should function act", async () => {
      await contract.addAdmin(addr[1].address);
      console.log(await contract.Admin());
      console.log(addr[1].address);
    });

    it("should mint", async () => {
      await contract.addAdmin(addr[1].address);
      await contract.connect(addr[1]).adminMint(3);
      console.log(await contract.tokenURI(2));
      console.log(await contract.setBaseURI("asdf"));
      console.log(await contract.withdraw());
    });
  });
});
