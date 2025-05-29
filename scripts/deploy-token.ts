import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying token from ${deployer.address}`);

  const name = "Attractor";
  const symbol = "ATTRA";
  const initialSupply = 1000000000; // 1 billion tokens

  const AttractorToken = await ethers.getContractFactory("AttractorToken");
  const token = await AttractorToken.deploy(name, symbol, initialSupply);
  
  console.log(`Token deployment started. Transaction hash: ${token.deployTransaction.hash}`);
  await token.deployed();
  
  console.log(`Token deployed to: ${token.address}`);
  console.log(`Token name: ${name}`);
  console.log(`Token symbol: ${symbol}`);
  console.log(`Initial supply: ${initialSupply} tokens`);
  console.log(`Decimals: ${await token.decimals()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
