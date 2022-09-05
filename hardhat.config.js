require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("./task/block-number");
require("solidity-coverage");

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 4,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },

    baobab: {
      url: "https://public-node-api.klaytnapi.com/v1/baobab",
      httpHeaders: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.ACCESS_KEY_ID + ":" + process.env.SECRET_ACCESS_KEY
          ).toString("base64"),
        "x-chain-id": "1001",
      },
      accounts: [process.env.PRIVATE_KEY || ""],
      chainId: 1001,
      gas: 250000000000,
      gasPrice: 25000000000,
    },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN,
  },
  gasReporter: {
    enabled: false,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: "ETH",
  },
};
