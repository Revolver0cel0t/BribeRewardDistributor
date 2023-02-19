import dotenv from "dotenv";
import keccakAlt from "keccak256";
import path from "path";
import { task } from "hardhat/config";
import { restore } from "firestore-export-import";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
import { admin, serviceAccount } from "../../lib/firebase";
import { MerkleTree } from "merkletreejs";
import { generateLeaf } from "./generateLeaf";
import fs from "fs";
import { getCurrentEpochTimestamp } from "../../utils";

const jsonToFirestore = async () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
    });
    console.log("Firebase Initialized");

    await restore(path.resolve(__dirname, "./output/proofs.json"));
    console.log("Upload Success");
  } catch (error) {
    console.log(error);
  }
};

const writeToFile = (array: any, filename: string) => {
  fs.writeFileSync(
    path.resolve(__dirname, `./output/${filename}`),
    JSON.stringify(array)
  );
};

task("generate-merkle-tree", "").setAction(async (_, { network, ethers }) => {
  const rewardFilepath = path.resolve(
    __dirname,
    "../getBribeRewardsAllUsers/output/rewards.json"
  );
  const rewardData = JSON.parse(fs.readFileSync(rewardFilepath).toString());

  const keys = Object.keys(rewardData);

  const leaves = keys.map((key: string) => {
    const reward = rewardData[key];
    const tokenKeys = Object.keys(reward);

    return generateLeaf(
      tokenKeys,
      tokenKeys.map((key: string) => reward[key]),
      key
    );
  });

  const tree = new MerkleTree(leaves, keccakAlt, {
    sortPairs: true,
  });

  const root = tree.getHexRoot();

  console.log("root hash of the tree is :", root);

  let proofs: any = {};
  leaves.forEach((leaf: any, index: number) => {
    const proof = tree.getHexProof(leaf);
    proofs[keys[index]] = {
      proof: proof,
      rewardInfo: rewardData[keys[index]],
    };
  });

  proofs["root"] = { proof: root };

  writeToFile(
    { [`BRIBE-REWARDS-EPOCH-${getCurrentEpochTimestamp()}`]: proofs },
    "proofs.json"
  );

  await jsonToFirestore();

  console.log("Done");
});
