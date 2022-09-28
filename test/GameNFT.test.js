const chai = require("chai");
const { ethers } = require("hardhat");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const crypto = require("crypto");

function combineSig(v, r, s) {
  return r.substr(2) + s.substr(2) + ethers.utils.hexValue(v).substr(2);
}

function splitSig(sig) {
  return {
    r: "0x" + sig.slice(0, 64),
    s: "0x" + sig.slice(64, 128),
    v: parseInt(sig.slice(128, 130), 16),
  };
}

describe("GameNFT", function () {
  let signingKey = new ethers.utils.SigningKey(
    "0x0000000000000000000000000000000000000000"
  );
  let signingKeyAddr = ethers.utils.computeAddress(signingKey.publicKey);
  let signer = { address: signingKeyAddr, key: signingKey };

  //let hash =  ethers.utils.solidityKeccak256(["address", "address", "address"],[extAcct.address, shares3.party1, shares3.party2]);
  //let sig = extAcct.key.signDigest(hash);

  let GameNFTContract;
  let game;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    GameNFTContract = await ethers.getContractFactory("GameNFT");
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    game = await GameNFTContract.deploy(
      signer.address,
      addr3.address,
      "https://ipfs.io/"
    ); //should be gameNFT address
    await game.deployed();
  });

  it("updateMintingFee() should allow to update MINTING_FEE", async function () {
    await game.updateMintingFee(ethers.utils.parseEther("0.1"));
    expect(await game.MINTING_FEE()).to.equal(ethers.utils.parseEther("0.1"));
  });

  it("updateMintingFee() should NOT allow to update MINTING_FEE unless the caller is the owner", async function () {
    await expect(
      game.connect(addr1).updateMintingFee(ethers.utils.parseEther("0.1"))
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("updateSigner() should allow to update signer", async function () {
    await game.updateSigner(addr3.address);
    expect(await game.getSigner()).to.equal(addr3.address);
  });

  it("updateSigner() should NOT allow to update signer unless the caller is the owner", async function () {
    await expect(
      game.connect(addr2).updateSigner(addr3.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("updateSigner() should NOT allow to update signer when isPermanent", async function () {
    await game.changeToPermanent();
    await expect(game.updateSigner(addr3.address)).to.be.revertedWith(
      "GameNFT: contract is fixed"
    );
  });

  it("updateBaseImgUrl() should NOT allow to update baseImgUrl unless the caller is the owner", async function () {
    const baseImgUrl = "https://ipfs.io/ipfs/";
    await expect(
      game.connect(addr1).updateBaseImgUrl(baseImgUrl)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("updateBaseImgUrl() should NOT allow to update baseImgUrl once isPermanent is set", async function () {
    await game.changeToPermanent();
    const baseImgUrl = "https://ipfs.io/ipfs/";
    await expect(game.updateBaseImgUrl(baseImgUrl)).to.be.revertedWith(
      "GameNFT: All images are on ipfs"
    );
  });

  it("updateMaxPublicId() should allow to update Max_Public_Id", async function () {
    let currentMaxId = await game.MAX_PUBLIC_ID();
    let newMax = currentMaxId + 1000;
    await game.updateMaxPublicId(newMax);
    expect(await game.MAX_PUBLIC_ID()).to.equal(currentMaxId + 1000);
  });

  it("updateMaxPreMulti() should allow to update MAX_PRE_MULTI", async function () {
    let currentMax = await game.MAX_PRE_MULTI();
    await game.updateMaxPreMulti(4);
    expect(await game.MAX_PRE_MULTI()).to.equal(4);
  });

  it("updateMaxPublicId() should NOT allow to update Max_Public_Id unless the caller is the owner", async function () {
    await expect(
      game.connect(addr3).updateMaxPublicId(1000)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("getNextPublicId() should return an next availabe id", async function () {
    let cid = await game.FOUNDER_COUNT(); //120
    expect(await game.getCurrentPublicId()).to.equal(cid);
    await game.setStateToPublicMint();
    let options = { value: (await game.MINTING_FEE()).mul(10) };
    await game.connect(addr1).publicMint(10, options); //130
    expect(await game.getCurrentPublicId()).to.equal(cid + 10); //130
    await game.connect(owner).updateMaxPublicId(cid + 10); // 130
    await game.connect(owner).adminMint([cid + 11, cid + 12]); // 131, 132
    await game.connect(owner).updateMaxPublicId(cid + 100);
    options = { value: (await game.MINTING_FEE()).mul(1) };
    await game.connect(addr1).publicMint(1, options); //133
    expect(await game.getCurrentPublicId()).to.equal(cid + 13); //133
  });

  it("changeToPermenent() should NOT allow to change the state unless the caller is the owner", async function () {
    await expect(game.connect(addr2).changeToPermanent()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("setStateToSetup() should change the State to Setup", async function () {
    await game.setStateToSetup();
    expect(await game.state()).to.equal(0);
  });

  it("setStateToSetup() should NOT change the State to Setup unless the caller is the owner", async function () {
    await expect(game.connect(addr3).setStateToSetup()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("setStateToSetup() should NOT change the State to Setup unless caller is the owner", async function () {
    await game.setStateToSetup();
    expect(await game.state()).to.equal(0);
  });

  it("setStateToPreMint() should change the State to PreMint", async function () {
    await game.setStateToPreMint();
    expect(await game.state()).to.equal(1);
  });

  it("setStateToPreMint() should NOT change the State to PreMint unless the caller is the owner", async function () {
    await expect(game.connect(addr2).setStateToPreMint()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("setStateToPublicMint() should change the State to PublicMint", async function () {
    await game.setStateToPublicMint();
    expect(await game.state()).to.equal(2);
  });

  it("setStateToPublicMint() should NOT change the State to PublicMint unless the caller is the owner", async function () {
    await expect(game.connect(addr1).setStateToPublicMint()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("setStateToFinished() should change the State to Finished", async function () {
    await game.setStateToFinished();
    expect(await game.state()).to.equal(3);
  });

  it("setStateToFinished() should NOT change the State to Finished unless the caller is the owner", async function () {
    await expect(game.connect(addr1).setStateToFinished()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("getBalance() should return current contract's balance", async function () {
    expect(await game.getBalance()).to.equal(0);
  });

  it("getHash() should return the hash", async function () {
    let hash = ethers.utils.solidityKeccak256(
      ["address", "address", "string"],
      [game.address, signer.address, "freeClaim"]
    );

    expect(
      await game.getHash(game.address, signer.address, "freeClaim")
    ).to.equal(hash);
  });

  it("verifyHash() should return recover address result", async function () {
    let hash = ethers.utils.solidityKeccak256(
      ["address", "address", "string", "string"],
      [game.address, addr1.address, "freeClaim", "1"]
    );
    let sig = signer.key.signDigest(hash);

    expect(await game.verifySig(hash, sig.v, sig.r, sig.s)).to.equal(true);
  });

  it("verifySig() using combined sig", async function () {
    let hash = ethers.utils.solidityKeccak256(
      ["address", "address", "string"],
      [game.address, addr1.address, "freeClaim"]
    );
    let sig = signer.key.signDigest(hash);
    //console.log(sig);
    let combinedSig = combineSig(sig.v, sig.r, sig.s);
    let s = splitSig(combinedSig);
    expect(await game.verifySig(hash, s.v, s.r, s.s)).to.equal(true);
  });

  it("freeClaim() should allow minting without minting fee using approving sig", async function () {
    let hash = ethers.utils.solidityKeccak256(
      ["address", "address", "string"],
      [game.address, addr1.address, "freeClaim"]
    );
    let sig = signer.key.signDigest(hash);
    let combinedSig = combineSig(sig.v, sig.r, sig.s);
    //console.log(combinedSig);
    let s = splitSig(combinedSig);

    await game.setStateToPreMint();
    await game.connect(addr1).freeClaim(s.v, s.r, s.s);
    expect(await game.tokensOf(addr1.address)).to.have.lengthOf(1);

    await expect(
      game.connect(addr1).freeClaim(s.v, s.r, s.s)
    ).to.eventually.be.rejectedWith(Error);
    //can not claim again
  });

  it("preMint() should allow minting using approving sig", async function () {
    let hash = ethers.utils.solidityKeccak256(
      ["address", "address", "string"],
      [game.address, addr1.address, "preMint"]
    );
    let sig = signer.key.signDigest(hash);
    let combinedSig = combineSig(sig.v, sig.r, sig.s);
    //console.log(combinedSig);
    let s = splitSig(combinedSig);

    await game.setStateToPreMint();
    let options = { value: (await game.MINTING_FEE()).mul(2) };
    await game.connect(addr1).preMint(s.v, s.r, s.s, 2, options);
    expect(await game.tokensOf(addr1.address)).to.have.lengthOf(2);

    await expect(
      game.connect(addr1).preMint(s.v, s.r, s.s, 1)
    ).to.eventually.be.rejectedWith(Error);
    //can not claim again
  });

  it("publicMint() should allow public minting", async function () {
    await game.setStateToPublicMint();
    let options = { value: (await game.MINTING_FEE()).mul(5) };
    await game.connect(addr1).publicMint(5, options);
    expect(await game.tokensOf(addr1.address)).to.have.lengthOf(5);

    let max_multi = await game.MAX_PUBLIC_MULTI();
    await expect(
      game.connect(addr1).preMint(max_multi)
    ).to.eventually.be.rejectedWith(Error);
    //can not claim again
  });

  it("adminMint() should allow admin minting", async function () {
    await game.connect(owner).adminMint([1, 2, 3, 4, 5]);
    expect(await game.tokensOf(owner.address)).to.have.lengthOf(5);

    await expect(
      game.connect(owner).adminMint([0])
    ).to.eventually.be.rejectedWith(Error);
    let founders = await game.FOUNDER_COUNT();
    await expect(
      game.connect(owner).adminMint([founders + 1])
    ).to.eventually.be.rejectedWith(Error);

    let max_count = await game.MAX_COUNT();
    await expect(
      game.connect(owner).adminMint([max_count + 1])
    ).to.eventually.be.rejectedWith(Error);
  });

  it("adminMintTo() should allow admin to minting to the target recipients", async function () {
    await game
      .connect(owner)
      .adminMintTo([3721, 3722], [addr1.address, addr2.address]);
    expect(await game.tokensOf(owner.address)).to.have.lengthOf(0);
    expect(await game.tokensOf(addr1.address)).to.have.lengthOf(1);
    expect(await game.tokensOf(addr2.address)).to.have.lengthOf(1);
  });

  it("transferBatch() should allow to transfer multiple tokens", async function () {
    await game.setStateToPublicMint();
    let options = { value: (await game.MINTING_FEE()).mul(10) };
    await game.connect(addr1).publicMint(10, options);
    let tokens = await game.tokensOf(addr1.address);
    expect(tokens).to.have.lengthOf(10);
    await game.connect(addr1).transferBatch(tokens, addr2.address);
    expect(await game.tokensOf(addr2.address)).to.have.lengthOf(10);
  });
});

describe("GameNFT - additional tests", function () {
  let signingKey = new ethers.utils.SigningKey(
    "0x0000000000000000000000000000000000000000"
  );
  let signingKeyAddr = ethers.utils.computeAddress(signingKey.publicKey);
  let signer = { address: signingKeyAddr, key: signingKey };

  //let hash =  ethers.utils.solidityKeccak256(["address", "address", "address"],[extAcct.address, shares3.party1, shares3.party2]);
  //let sig = extAcct.key.signDigest(hash);

  let GameNFTContract;
  let game;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    GameNFTContract = await ethers.getContractFactory("GameNFT");
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    game = await GameNFTContract.deploy(
      signer.address,
      addr3.address,
      "https://ipfs.io/"
    ); //should be gameNFT address
    await game.deployed();
  });

  it("freeClaim() should allow minting only in the states, PreMint and PublicMint", async function () {
    let hash = ethers.utils.solidityKeccak256(
      ["address", "address", "string"],
      [game.address, addr1.address, "freeClaim"]
    );
    let sig = signer.key.signDigest(hash);
    let combinedSig = combineSig(sig.v, sig.r, sig.s);
    // console.log(combinedSig);
    let s = splitSig(combinedSig);

    await game.setStateToSetup();
    await expect(
      game.connect(addr1).freeClaim(s.v, s.r, s.s)
    ).to.be.revertedWith("GameNFT: State is not in PreMint or PublicMint");

    await game.setStateToFinished();
    await expect(
      game.connect(addr1).freeClaim(s.v, s.r, s.s)
    ).to.be.revertedWith("GameNFT: State is not in PreMint or PublicMint");

    await game.setStateToPreMint();
    await game.connect(addr1).freeClaim(s.v, s.r, s.s);
    expect(await game.tokensOf(addr1.address)).to.have.lengthOf(1);
  });

  it("preMint() should allow minting only in the state, PreMint", async function () {
    let hash = ethers.utils.solidityKeccak256(
      ["address", "address", "string"],
      [game.address, addr1.address, "preMint"]
    );
    let sig = signer.key.signDigest(hash);
    let combinedSig = combineSig(sig.v, sig.r, sig.s);
    // console.log(combinedSig);
    let s = splitSig(combinedSig);

    let options = { value: (await game.MINTING_FEE()).mul(2) };

    await game.setStateToSetup();
    await expect(
      game.connect(addr1).preMint(s.v, s.r, s.s, 2, options)
    ).to.be.revertedWith("GameNFT: State is not in PreMint");

    await game.setStateToPublicMint();
    await expect(
      game.connect(addr1).preMint(s.v, s.r, s.s, 2, options)
    ).to.be.revertedWith("GameNFT: State is not in PreMint");

    await game.setStateToFinished();
    await expect(
      game.connect(addr1).preMint(s.v, s.r, s.s, 2, options)
    ).to.be.revertedWith("GameNFT: State is not in PreMint");

    await game.setStateToPreMint();
    await game.connect(addr1).preMint(s.v, s.r, s.s, 2, options);
    expect(await game.tokensOf(addr1.address)).to.have.lengthOf(2);
  });

  it("publicMint() should allow minting only in the state, PublicMint", async function () {
    let options = { value: (await game.MINTING_FEE()).mul(5) };

    await game.setStateToSetup();
    await expect(game.connect(addr1).publicMint(5, options)).to.be.revertedWith(
      "GameNFT: State is not in PublicMint"
    );

    await game.setStateToPreMint();
    await expect(game.connect(addr1).publicMint(5, options)).to.be.revertedWith(
      "GameNFT: State is not in PublicMint"
    );

    await game.setStateToFinished();
    await expect(game.connect(addr1).publicMint(5, options)).to.be.revertedWith(
      "GameNFT: State is not in PublicMint"
    );

    await game.setStateToPublicMint();
    await game.connect(addr1).publicMint(5, options);
    expect(await game.tokensOf(addr1.address)).to.have.lengthOf(5);
  });

  it("adminMint() should allow admin minting in all of the states", async function () {
    await game.setStateToSetup();
    await game.connect(owner).adminMint([1, 2]);

    await game.setStateToPreMint();
    await game.connect(owner).adminMint([3, 4, 5]);

    await game.setStateToPublicMint();
    await game.connect(owner).adminMint([6, 7]);

    await game.setStateToFinished();
    await game.connect(owner).adminMint([8, 9, 10]);

    expect(await game.tokensOf(owner.address)).to.have.lengthOf(10);
  });
});
