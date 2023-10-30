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

task('fund', 'Move funds to specified faucet')
  .addPositionalParam('address', 'Address of faucet to send funds to')
  .addPositionalParam('amount', 'Amount of tokens to send')
  .setAction(async ({ address, amount }, hre) => {
    const Faucet = await hre.ethers.getContractFactory('Faucet');
    const faucet = Faucet.attach(address);
    const token = await faucet.token();
    const [bank] = await hre.ethers.getSigners();

    if (token === '0x' + '0'.repeat(40)) {
      console.log(`About to fund ${address} with ${amount} ether`);
      const etherAmount = hre.ethers.utils.parseEther(amount);
      const response = await bank.sendTransaction({
        value: etherAmount,
        to: address,
      });
      console.log(`Transaction hash is ${response.hash}`);
      await response.wait(parseInt(getenv('MIN_CONFIRMATIONS')));
    } else {
      const ERC20 = await hre.ethers.getContractFactory('ERC20');
      const erc20 = ERC20.attach(token);
      const [symbol, name, decimals] = await Promise.all([
        erc20.callStatic.symbol(),
        erc20.callStatic.name(),
        erc20.callStatic.decimals().then((value: string) => Number(value)),
      ]);
      console.log(`About to fund ${address} with ${amount} ${symbol} (${name})`);
      const tokenAmount = hre.ethers.utils.parseUnits(amount, decimals);
      const connectedToken = erc20.connect(bank);
      const tx = await connectedToken.transfer(address, tokenAmount);
      await tx.wait()
    }

    console.log(`Successfully funded!`);
  })

  task('trust', 'Set trusted signer of a faucet')
  .addPositionalParam('address', 'Address of faucet to change')
  .addPositionalParam('signer', 'Address of trusted signer')
  .setAction(async ({ address, signer }, hre) => {
    const Faucet = await hre.ethers.getContractFactory('Faucet');
    const faucet = Faucet.attach(address);
    console.log(`About to transfer trust of ${address} to ${signer}`);
    const tx = await faucet.trust(signer)
    console.log(`transaction hash is ${tx.hash}`);
    await tx.wait(parseInt(getenv('MIN_CONFIRMATIONS')));
    console.log(`Job is done.`);
  });

task('retrust', 'Generate and set new trusted address of faucet')
  .addPositionalParam('address', 'Address of faucet to change')
  .setAction(async ({ address }, hre) => {
    const Faucet = await hre.ethers.getContractFactory('Faucet');
    const faucet = Faucet.attach(address);
    const wallet = hre.ethers.Wallet.createRandom();
    console.log(`Signer private key is ${wallet.privateKey}`);
    console.log(`About to transfer trust of ${address} to ${wallet.address}`);
    const tx = await faucet.trust(wallet.address);
    console.log(`Transaction hash is ${tx.hash}`);
    await tx.wait(parseInt(getenv('MIN_CONFIRMATIONS')));
    console.log(`Job is done.`);
  });

task('trust', 'Set trusted signer of a faucet')
  .addPositionalParam('address', 'Address of faucet to change')
  .addPositionalParam('signer', 'Address of trusted signer')
  .setAction(async ({ address, signer }, hre) => {
    const Faucet = await hre.ethers.getContractFactory('Faucet');
    const faucet = Faucet.attach(address);
    console.log(`About to transfer trust of ${address} to ${signer}`);
    const tx = await faucet.trust(signer)
    console.log(`Transaction hash is ${tx.hash}`);
    await tx.wait(parseInt(getenv('MIN_CONFIRMATIONS')));
    console.log(`Job is done.`);
  });

export default config;
