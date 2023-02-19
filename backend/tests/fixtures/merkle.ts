import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

export async function deployMerkleFixture() {
  const proofsFilePath = path.resolve(
    __dirname,
    "../scripts/generateMerkleTree/output/proofs.json"
  );

  const proofs = JSON.parse(fs.readFileSync(proofsFilePath).toString());
  const parentKey = Object.keys(proofs)[0];

  const root = proofs[parentKey]["root"];

  const [owner, otherAccount] = await ethers.getSigners();
  const MerkleClaimer = await ethers.getContractFactory(
    "MerkleClaimMultipleERC20"
  );

  const merkleClaimer = await MerkleClaimer.deploy(root);

  return {
    proofs: proofs[parentKey],
    root,
    merkleClaimer,
    owner,
    otherAccount,
  };
}
