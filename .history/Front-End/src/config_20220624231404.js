module.exports = {
    testnet: {
      JuniorNFT_Address: "0xAE19E201a06ECA9375daaA1d2436562De5184836", // rinkeby
      JuniorNFT_Decimals: 18,
  
      // chain info
      RinkebyChainID: 4,
      // rpc info
      parentProvider: `https://eth-rinkeby.alchemyapi.io/v2/rDhBiw4G50Df2xiWkKAEcZs4WenDNpNl`,
    },
    abi: {
      JuniorNFT_ABI: 
        "function addAdmin(address newAdmin) public",
        "function mint(uint256 quantity) external payable",
        "function safeMint(address to, uint256 quantity) private returns(bool)",
        "function adminMint(uint256 quantity) external",
        "function transferBatch(uint256[] calldata tokenIds, address to) external",
        "function tokenURI(uint256 tokenId) public view override returns(string memory)",
        "getBaseURI() external view returns (string memory)",
        "_baseURI() internal view override returns (string memory)",
    },
  };
  