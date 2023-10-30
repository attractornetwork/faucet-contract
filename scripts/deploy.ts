import { ethers, network } from "hardhat";
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const checkpoint = Math.round(Date.now() / 1000);
  const [deployer] = await ethers.getSigners();
  console.log(`About to deploy Faucet from ${deployer.address}`);
  const balance = await deployer.getBalance();
  console.log(`Deployer balance is ${ethers.utils.formatEther(balance)}`);

  const signer = ethers.Wallet.createRandom();
  const token = ethers.utils.getAddress(process.env.FAUCET_TOKEN_ADDRESS || 'nonsense');
  const portion = ethers.BigNumber.from(process.env.FAUCET_TOKEN_PORTION || 'kitten');
  const Faucet = await ethers.getContractFactory('Faucet');
  const faucet = await Faucet.deploy(token, portion, signer.address);
  const deployment = faucet.deployTransaction;
  console.log(`Deployment started. Transaction hash is ${deployment.hash}`);
  console.log(`Saving info...`);

  const doc = {
    faucet: {
      network: {
        name: network.name,
        chainId: network.config.chainId,
      },
      address: faucet.address,
      token: await faucet.token(),
      portion: (await faucet.portion()).toString(),
      deployer: deployment.from,
      owner: await faucet.owner(),
      signer: {
        address: signer.address,
        privateKey: signer.privateKey,
      },
    },
  };
  const filekey = `faucet-${checkpoint}.json`;
  const filename = path.join(process.cwd(), 'deploy', filekey);
  fs.writeFileSync(filename, JSON.stringify(doc, undefined, 2));
  console.log(`Deployment info has beed saved to ${filename}`);

  const confirmations = parseInt(process.env.MIN_CONFIRMATIONS ?? 'fill .env bro');
  console.log(`Waiting for ${confirmations} confirmations...`);
  await deployment.wait(confirmations);
  console.log(`The job is done :)`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
