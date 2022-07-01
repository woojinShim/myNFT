const { ethers } = require("hardhat");

const networkConfig = {
  // default: {
  //   name: "hardhat",
  //   keepersUpdateInterval: "30",
  // },
  4: {
    name: "rinkeby",
    vrfCoordinatorV2: "0x271682DEB8C4E0901D1a1550aD2e64D568E69909",
    entranceFee: ethers.utils.parseEther("0.01"),
    gasLane:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    subscriptionId: "6410",
    callbackGasLimit: "500000",
    interval: "30",
  },
  31337: {
    name: "hardhat",
    entranceFee: ethers.utils.parseEther("0.01"),
    gasLane:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    callbackGasLimit: "500000",
    interval: "30",
  },
};

const developmentChains = ["hardhat", "localhost"];

const frontEndContractsFile =
  "../lottery/raffle-front-end/constants/contractAddresses.json";
const frontEndAbiFile = "../lottery/raffle-front-end/constants/abi.json";

module.exports = {
  networkConfig,
  developmentChains,
  frontEndContractsFile,
  frontEndAbiFile,
};
