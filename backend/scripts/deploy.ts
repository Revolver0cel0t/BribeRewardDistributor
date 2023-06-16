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
      "0x25f51378261f7aa4b2a70a485c01301adf5202d3a817a2a3a8f4a8f62e0b10f8"; //place merkle root here

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
