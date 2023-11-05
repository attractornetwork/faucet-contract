import { ethers } from "hardhat";
import { expect } from 'chai';
import { Faucet } from "../typechain-types";

describe('Faucet contract', () => {
  let faucet: Faucet;
  let trustedSigner: InstanceType<(typeof ethers)['Wallet']>;

  beforeEach(async () => {
    const [deployer] = await ethers.getSigners();
    trustedSigner = ethers.Wallet.createRandom().connect(deployer.provider!);
    const Faucet = await ethers.getContractFactory('Faucet');
    const portion = ethers.utils.parseEther('1');
    faucet = await Faucet.deploy(
      '0x' + '0'.repeat(40),
      portion,
      trustedSigner.address,
    );
    const fundTx = await deployer.sendTransaction({
      value: ethers.utils.parseEther("10"),
      to: faucet.address,
    });
    await fundTx.wait(1);
  });

  async function createSignature(addr: string, name: string, deadline: number) {
    const hash = ethers.utils.solidityKeccak256(
      ['string', 'address', 'bytes32', 'address', 'uint64'],
      [
        'Attractor faucet dispension! Our lucky guy is',
        addr,
        name,
        faucet.address,
        deadline,
      ],
    );
    const hashBytes = ethers.utils.arrayify(hash);
    const sigString = await trustedSigner.signMessage(hashBytes);
    return ethers.utils.splitSignature(sigString);
  }

  it('Should pass normal flow', async () => {
    const recipient = ethers.Wallet.createRandom().connect(ethers.provider);
    const remoteIp = '1.1.1.1';
    const identity = ethers.utils.soliditySha256(['string'], [remoteIp]);
    const actor = {
      name: identity,
      addr: recipient.address,
    };
    const deadline = Math.round(Date.now() / 1000) + 300;
    const sig = await createSignature(actor.addr, actor.name, deadline);
    const dispenseTx = await faucet.dispense(actor, sig, deadline);
    await dispenseTx.wait(1);
    const recipientBal = await recipient.getBalance();
    expect(recipientBal.toString()).equal((await faucet.portion()).toString());
  });

  it('Should throw 0xda6deef8 on deadline limit reached', async () => {
    const recipient = ethers.Wallet.createRandom().connect(ethers.provider);
    const remoteIp = '129.10.99.54';
    const identity = ethers.utils.soliditySha256(['string'], [remoteIp]);
    const actor = { name: identity, addr: recipient.address };
    const deadline = Math.round(Date.now() / 1000) + 60 * 60 * 24 * 7;
    const sig = await createSignature(actor.addr, actor.name, deadline);
    await expect(faucet.dispense(actor, sig, deadline)).rejectedWith('DeadlineIsTooFar()');
  });
});
