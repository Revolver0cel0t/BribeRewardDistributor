/**
 * @type import('hardhat/config').HardhatUserConfig
 */
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-web3";

const { subtask } = require("hardhat/config");
const {
  TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS,
} = require("hardhat/builtin-tasks/task-names");

// register tasks
import "./scripts/getBribeRewardsAllUsers";
import "./scripts/generateMerkleTree";
import "./scripts/epochFlip";
import "./scripts/deploy";
import "./scripts/calculateAirdrop";
import "./scripts/calculateAirdrop/getFinalBalances";
import "./scripts/calculateAirdrop/getInitialUserSnapshot";
import "./scripts/emissionsCalculator";

// ignore test files
subtask(TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS).setAction(
  async (_: any, __: any, runSuper: any) => {
    const paths = await runSuper();
    return paths.filter((p: any) => !p.endsWith(".t.sol"));
  }
);

module.exports = {
  defaultNetwork: "hardhat",
  gasReporter: {
    showTimeSpent: true,
    currency: "USD",
  },
  networks: {
    hardhat: {
      forking: {
        url:
          "https://arb-mainnet.alchemyapi.io/v2/" + process.env.ALCHEMY_API_KEY,
        blockNumber: 14878741,
      },
    },
    local: {
      url: "http://127.0.0.1:8545/",
      accounts: [process.env.PRIVATE_KEY],
      timeout: 100000000,
      mocha: {
        timeout: 100000000,
      },
      blockNumber: 65804153,
    },
    arbitrumOne: {
      url:
        "https://arb-mainnet.g.alchemy.com/v2/" + process.env.ALCHEMY_API_KEY,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    goerli: {
      url: "https://eth-goerli.alchemyapi.io/v2/" + process.env.ALCHEMY_API_KEY,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    arbitrumTestnet: {
      url:
        "https://arb-rinkeby.g.alchemy.com/v2/" + process.env.ALCHEMY_API_KEY,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    arbGoerliRollup: {
      url: "https://arb-goerli.g.alchemy.com/v2/" + process.env.ALCHEMY_API_KEY,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 421613,
    },
    ...(process.env.ETH_MAINNET_FORK
      ? {
          mainnet_fork: {
            url: process.env.ETH_MAINNET_FORK,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
          },
        }
      : {}),
  },
  solidity: {
    version: "0.8.11",
    settings: {
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  paths: {
    sources: "./contracts",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 100000000,
  },
  etherscan: {
    customChains: [
      {
        network: "arbGoerliRollup",
        chainId: 421613,
        urls: {
          apiURL: "https://goerli-rollup-explorer.arbitrum.io/api",
          browserURL: "https://goerli-rollup-explorer.arbitrum.io/",
        },
      },
    ],
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      arbitrumOne: process.env.ARBSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      arbitrumTestnet: process.env.ARBSCAN_API_KEY,
      arbGoerliRollup: "0",
    },
  },
  abiExporter: {
    path: "./abi",
    clear: true,
    flat: true,
    spacing: 2,
  },
};
