import dotenv from "dotenv";
import path from "path";
import { task } from "hardhat/config";
import { restore } from "firestore-export-import";
dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });
import { admin, serviceAccount } from "../../lib/firebase";
import fs from "fs";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { BigNumber } from "ethers";

const jsonToFirestore = async (fileName: string) => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
    });
    console.log("Firebase Initialized");

    await restore(path.resolve(__dirname, "output/" + fileName));
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

task("generate-merkle-tree", "")
  .addParam("blocktimestamp", "Timestamp for bribes")
  .addOptionalParam(
    "airdropname",
    "To consider the input from airdrop or merkle"
  )
  .setAction(async ({ blocktimestamp, airdropname }) => {
    const rewardFilepath = path.resolve(
      __dirname,
      airdropname
        ? "../calculateAirdrop/output/formattedFinal.json"
        : "../getBribeRewardsAllUsers/output/rewards.json"
    );
    const rewardData = JSON.parse(fs.readFileSync(rewardFilepath).toString());

    const keys = Object.keys(rewardData);

    const leaves = keys.map((key: string) => {
      const reward = rewardData[key];
      const tokenKeys = Object.keys(reward);

      return [tokenKeys, tokenKeys.map((key: string) => reward[key]), key];
    });

    const tree = StandardMerkleTree.of(leaves, [
      "address[]",
      "uint256[]",
      "address",
    ]);

    const root = tree.root;

    console.log("root hash of the tree is :", root);

    let proofs: any = {};
    for (const [index, leaf] of tree.entries()) {
      const proof = tree.getProof(index);
      proofs[leaf[2] as string] = {
        proof: proof,
        rewardInfo: {
          tokens: leaf[0],
          amounts: leaf[1],
        },
      };
    }

    proofs["root"] = { proof: root };

    const fileName = airdropname ? "airdropProofs.json" : "proofs.json";

    writeToFile(
      {
        [airdropname ? airdropname : `BRIBE-REWARDS-EPOCH-${blocktimestamp}`]:
          proofs,
      },
      fileName
    );

    await jsonToFirestore(fileName);

    console.log("Done");
  });

task("verify-amounts", "").setAction(async (_) => {
  const rewardFilepath = path.resolve(
    __dirname,
    "../getBribeRewardsAllUsers/output/totalRewardAmts.json"
  );
  const rewardData = JSON.parse(fs.readFileSync(rewardFilepath).toString());

  const proofsFilepath = path.resolve(__dirname, "./output/proofs.json");
  const proofs = JSON.parse(fs.readFileSync(proofsFilepath).toString());

  const rewardKeys = Object.keys(rewardData);
  const proofKeys = Object.keys(proofs);

  const proofData = proofs[proofKeys[0]];

  const proofRewardKeys = Object.keys(proofData);

  console.log(
    "Total users to distro rewards to : ",
    proofRewardKeys.length - 1
  );

  let amts: Record<string, BigNumber> = {};
  let users: Record<string, boolean> = {};

  proofRewardKeys.forEach((key) => {
    if (key !== "root") {
      if (!users[key.toLowerCase()]) {
        users[key.toLowerCase()] = true;
      } else {
        console.log(key, "is repeating");
        throw new Error();
      }
      proofData[key].rewardInfo.tokens.forEach(
        (token: string, index: number) => {
          if (!amts[token]) amts[token] = BigNumber.from("0");
          amts[token] = amts[token].add(
            proofData[key].rewardInfo.amounts[index]
          );
        }
      );
    }
  });

  rewardKeys.forEach((key) => {
    console.log(rewardData[key], amts[key].toString(), key);

    if (!BigNumber.from(rewardData[key]).eq(amts[key])) {
      throw new Error();
    } else {
      console.log(`Amounts for ${key} valid`);
    }
  });

  console.log("Done.");
});
