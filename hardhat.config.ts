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

task('transfer', 'Transfer ownership of a faucet')
  .addPositionalParam('address', 'Address of faucet to transfer')
  .addPositionalParam('owner', 'Address of faucet to transfer')
  .setAction(async ({ address, owner }, hre) => {
    console.log(`About to transfer ownership of ${address} to ${owner}`);
    const Faucet = await hre.ethers.getContractFactory('Faucet');
    const faucet = Faucet.attach(address);
    const tx = await faucet.transferOwnership(owner);
    console.log(`Transaction hash is ${tx.hash}`);
    await tx.wait(parseInt(getenv('MIN_CONFIRMATIONS')));
    console.log(`Transfer confirmed. Job is done!`);
  });

task('flush', 'Flush all dispensible tokens from a faucet')
  .addPositionalParam('address', 'Address of faucet to interact with')
  .setAction(async ({ address }, hre) => {
    const Faucet = await hre.ethers.getContractFactory('Faucet');
    const faucet = Faucet.attach(address);
    console.log(`About to flush tokens from ${address}`);
    
    const tx = await faucet.flush();
    console.log(`Transaction hash is ${tx.hash}`);
    await tx.wait(parseInt(getenv('MIN_CONFIRMATIONS')));
    console.log(`Flush confirmed. The job is done!`);
  });

task('dispense', 'Dispense tokens from a faucet')
  .addPositionalParam('address', 'Address of faucet to trigger')
  .addPositionalParam('recipient', 'Account to receive tokens')
  .addPositionalParam('identity', 'Account identity e.g. ip-address')
  .setAction(async ({ address, recipient, identity }, hre) => {
    console.log(`About to dispense tokens from ${address} to ${recipient}`);
    const signer = new hre.ethers.Wallet(getenv('FAUCET_SIGNER_PRIV_KEY'));
    const Faucet = await hre.ethers.getContractFactory('Faucet');
    const faucet = Faucet.attach(address);
    const deadline = Math.round(Date.now() / 1000) + 60 * 20;
    const name = hre.ethers.utils.solidityKeccak256(['string'], [identity]);
    const hash = hre.ethers.utils.solidityKeccak256(
      ["string", "address", "bytes32", "address", "uint64"],
      [
        "Attractor faucet dispension! Our lucky guy is",
        recipient,
        name,
        faucet.address,
        deadline,
      ],
    );
    console.log(hash);
    const hashBytes = hre.ethers.utils.arrayify(hash);
    const sigString = await signer.signMessage(hashBytes);
    const signature = hre.ethers.utils.splitSignature(sigString);
    const actor = { addr: recipient, name };
    const tx = await faucet.dispense(actor, signature, deadline);
    console.log(`Transaction hash is ${tx.hash}`);
    await tx.wait(parseInt(getenv('MIN_CONFIRMATIONS')));
    console.log(`Dispensiom confirmed. Job is done!`);
  });

export default config;
