const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseUnits, parseEther } = require("ethers/lib/utils");

describe("MyNFT", () => {
  const baseUri = "http://defaultURIfix";

  let nft;
  let owner, addr;

  beforeEach(async () => {
    [owner, ...addr] = await ethers.getSigners();

    const MyNFT = await ethers.getContractFactory("MyNFT");
    nft = await MyNFT.deploy("http://baseURI", "http://defaultURI");
    await nft.deployed();
  });

  describe("nft", () => {
    it("should be register an administrator", async () => {
      await expect(nft.setMintingFee(parseEther("10"))).to.revertedWith(
        "Not allowed address"
      );
      let tx = await nft.addAdmin(owner.address);
      tx.wait();
      expect(await nft.Admin()).to.equal(owner.address);
    });

    it("should be set a minting fee", async () => {
      let tx = await nft.addAdmin(owner.address);
      tx.wait();

      await expect(nft.mint(3, { value: parseUnits("30") })).to.revertedWith(
        "NoMatchingFee()"
      );

      tx = await nft.setMintingFee(parseEther("10"));
      expect(await nft.getMinintgFee()).to.equal(parseEther("10"));
    });

    it("Cannot mint more than 5 at a time", async () => {
      let tx = await nft.addAdmin(owner.address);
      tx = await nft.setMintingFee(parseEther("10"));
      await expect(nft.mint(6, { value: parseUnits("60") })).to.revertedWith(
        "ExceedMaxQuantity()"
      );
    });

    it("After minting, the nft should match the owner's balance", async () => {
      let tx = await nft.addAdmin(owner.address);
      tx = await nft.setMintingFee(parseEther("10"));
      tx = await nft.mint(3, { value: parseUnits("30") });
      expect(await nft.balanceOf(owner.address)).to.equal(3);
    });

    it("Before reveal, tokenURI must be defaultURI", async () => {
      let tx = await nft.addAdmin(owner.address);
      tx = await nft.setMintingFee(parseEther("10"));
      tx = await nft.mint(3, { value: parseUnits("30") });
      expect(await nft.revealed()).to.equal(false);
      expect(await nft.tokenURI(1)).to.equal("http://defaultURI/1.json");
    });

    it("After reveal, tokenURI should be baseURI", async () => {
      let tx = await nft.addAdmin(owner.address);
      tx = await nft.setMintingFee(parseEther("10"));
      tx = await nft.mint(3, { value: parseUnits("30") });
      tx = await nft.reveal();
      expect(await nft.revealed()).to.equal(true);
      expect(await nft.tokenURI(1)).to.equal("http://baseURI/1.json");
    });

    it("Can set the baseURl", async () => {
      let tx = await nft.addAdmin(owner.address);
      tx = await nft.setBaseURI(baseUri);
      expect(await nft.getBaseURI()).to.equal("http://defaultURIfix");
    });
  });
});
