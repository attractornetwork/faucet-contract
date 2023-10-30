import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from 'dotenv';
dotenv.config();

function getenv(key: string): string {
  const env = process.env[key];
  if (!env) throw new Error(`Missing process.env.${key}`);
  return env;
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.20',
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000,
          }
        }
      }
    ]
  },
  networks: {
    attratest: {
      chainId: 9701,
      url: getenv('ATTRA_TESTNET_URL'),
      accounts: [getenv('ACCOUNT_PRIV_KEY')],
    },
  },
  etherscan: {
    apiKey: {
      attratest: getenv('ATTRA_EXPLORER_API_KEY'),
    },
    customChains: [
      {
        chainId: 9701,
        network: 'attratest',
        urls: {
          apiURL: 'https://explorer.dev.attra.me/api',
          browserURL: 'https://explorer.dev.attra.me/',
        },
      }
    ]
  }
};

export default config;
