import { ethers, network } from "hardhat";
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const checkpoint = Math.round(new Date().getTime() / 1000);
  const [deployer] = await ethers.getSigners();
  console.log(`About to deploy Faucet from ${deployer.address}`);
  const balance = await deployer.getBalance();
  console.log(`Deployer balance is ${ethers.utils.formatEther(balance)}`);

  const wallet = ethers.Wallet.createRandom();
  const signer = await wallet.getAddress();
  const token = process.env.FAUCET_TOKEN_ADDRESS || '0x' + '0'.repeat(40);
  const portion = process.env.FAUCET_TOKEN_PORTION || '1' + '0'.repeat(18);
  const Faucet = await ethers.getContractFactory("Faucet");
  const faucet = await Faucet.deploy(signer, token, portion);
  const deployment = faucet.deployTransaction;
  console.log(`Deployment started. Transaction hash is ${deployment.hash}`);
  const confirmations = parseInt(process.env.MIN_CONFIRMATIONS ?? '2'); 
  console.log(`Waiting for ${confirmations} confirmations...`);
  await deployment.wait(2);
  console.log(`The job is done :)`);
  console.log(`Saving info...`);

  const doc = {
    faucet: {
      network: {
        name: network.name,
        chainId: network.config.chainId,
      },
      address: faucet.address,
      token: await faucet.callStatic.token(),
      portion: (await faucet.callStatic.portion()).toString(),
      deployer: deployment.from,
      owner: await faucet.callStatic.owner(),
      signer: {
        address: signer,
        privateKey: wallet.privateKey,
      },
    },
  };
  const filekey = `faucet-${checkpoint}.json`;
  const filename = path.join(__filename, '../deploy', filekey);
  fs.writeFileSync(filename, JSON.stringify(doc, undefined, 2));
  console.log(`Deployment info has beed saved to ${filename}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
