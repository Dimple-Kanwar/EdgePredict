import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv/config");

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./src/contracts",
    tests: "./src/test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  },
  defaultNetwork: "hardhat",
  networks: {
    citrea: {
      url: "https://rpc.testnet.citrea.xyz",
      chainId: 5115,
      accounts: [`${process.env.PRIVATE_KEY}`],
    },
    rootstock: {
      chainId: 31,
      accounts: [`${process.env.PRIVATE_KEY}`],
      url: `${process.env.ROOTSTOCK_RPC_URL}`
    },
    fractal:{
      chainId: 31,
      accounts: [`${process.env.PRIVATE_KEY}`],
      url: `${process.env.ROOTSTOCK_RPC_URL}`
    }
  },
};

export default config;
