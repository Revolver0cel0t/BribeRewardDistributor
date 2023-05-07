import { task } from "hardhat/config";
import BN from "bignumber.js";
import fs from "fs";
import path from "path";

task("deploy-merkle-claim", "Deploy MerkleClaim contract").setAction(
  async (_, { network, ethers, run }) => {
    const configFilePath = path.join(
      __dirname,
      "config",
      network.name + ".json"
    );
    const config = JSON.parse(fs.readFileSync(configFilePath).toString());

    const merkleRoot =
      "0xc83f4f85a1a7f4c04861ed781922ec19fa2c36a3fc7539866b4b67915cb89fb3"; //place merkle root here

    const MerkleClaim = await ethers.getContractFactory(
      "MerkleClaimMultipleERC20"
    );
    const merkleClaim = await MerkleClaim.deploy(merkleRoot);
    await merkleClaim.deployed();
    console.log("Merkle Claim address:", merkleClaim.address);

    config.merkleClaimAddress = merkleClaim.address;
    fs.writeFileSync(configFilePath, JSON.stringify(config));

    // if (network.name !== "hardhat") {
    //   console.log("Verifying ExternalBribeFactory");
    //   await run("verify:verify", {
    //     address: config.merkleClaimAddress,
    //     constructorArguments: [merkleRoot],
    //   }).catch(console.error);
    // }
  }
);
