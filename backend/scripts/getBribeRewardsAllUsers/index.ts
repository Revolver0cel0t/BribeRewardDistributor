import { task } from "hardhat/config";
import fs from "fs";
import path from "path";
//@ts-ignore
import eachLimit from "async/eachLimit";
import { BigNumber } from "ethers";
import { Contract } from "ethers-multicall";
import VE_ABI from "./abis/veABI.json";
import VOTER_ABI from "./abis/voterABI.json";
import { allSwapPairs, getLocks } from "../../subgraph/fetchers";
import { VE_ADDRESS, VOTER_ADDRESS, WEI, ZERO } from "../../constants";
import {
  getMulticallProvider,
  multicallSplitOnOverflow,
} from "../../lib/multicall";
import { getCurrentEpochTimestamp } from "../../utils";
import axios from "axios";

Object.defineProperties(BigNumber.prototype, {
  toJSON: {
    value: function (this: BigNumber) {
      return this.toString();
    },
  },
});

async function getFullDataForTokens(locks: any[], chainId: number) {
  const ethcallProvider = await getMulticallProvider(chainId);
  const VotingEscrowContract = new Contract(VE_ADDRESS[chainId], VE_ABI);
  const ownerOfCalls = locks.map(({ tokenId }: { tokenId: number }) =>
    VotingEscrowContract.ownerOf(tokenId)
  );

  const ownerData = await multicallSplitOnOverflow(
    ownerOfCalls,
    ethcallProvider,
    {
      maxCallsPerBatch: 300,
    }
  );
  return ownerData.map((ownerOf: string, index: number) => ({
    ...locks[index],
    owner: ownerOf,
  }));
}

async function getAllUnexpiredLocks(locks: any[], chainId: number) {
  const ethcallProvider = await getMulticallProvider(chainId);
  const VotingEscrowContract = new Contract(VE_ADDRESS[chainId], VE_ABI);
  const lockedEndCalls = locks.map(({ tokenId }: { tokenId: number }) =>
    VotingEscrowContract.locked__end(tokenId)
  );
  const lockedEnds = await multicallSplitOnOverflow(
    lockedEndCalls,
    ethcallProvider,
    {
      maxCallsPerBatch: 300,
    }
  );
  return lockedEnds.flatMap((lockedEnd: BigNumber, index: number) => {
    const currentEpochTimestamp = getCurrentEpochTimestamp();
    return !lockedEnd.lt(currentEpochTimestamp) ? [locks[index]] : [];
  });
}

task("get-block-number-for-epoch-start").setAction(async (_) => {
  const result = await axios.get(
    `https://coins.llama.fi/block/arbitrum/${getCurrentEpochTimestamp()}`
  );

  console.log("Block number", result.data.height);
});

task("get-epoch-start").setAction(async (_) => {
  console.log(getCurrentEpochTimestamp());
});

task("calculate-bribe-rewards", "").setAction(
  async (_, { network, ethers }) => {
    const chainId = network.config.chainId as number;
    const bribesFilePath = path.join(__dirname, "input", "bribes.json");
    const bribeInputs = JSON.parse(fs.readFileSync(bribesFilePath).toString());
    const [Voter, pairs, lockData] = await Promise.all([
      ethers.getContractAt(VOTER_ABI, VOTER_ADDRESS[chainId]),
      allSwapPairs(network.name),
      getLocks(network.name),
    ]);

    let allTokenRewards: Record<string, Record<string, BigNumber>> = {};
    let totalRewards: Record<string, BigNumber> = {};

    const unexpiredLocks = await getAllUnexpiredLocks(lockData, chainId);

    const locks = await getFullDataForTokens(unexpiredLocks, chainId);

    console.log({ locks: locks.length, pairs: pairs.length });

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const rewardData = bribeInputs[pair.bribe.address];
      if (!rewardData) continue;

      const totalGaugeWeight: BigNumber = await Voter.weights(
        pair.gaugeAddress
      );
      const tokenKeys = Object.keys(rewardData);

      console.log(
        `= start - ${i} - ${pair.stable ? "sAMM" : "vAMM"}-${
          pair.token0.symbol
        }/${pair.token1.symbol}`
      );

      await eachLimit(
        locks,
        50,
        async ({ tokenId, owner }: { tokenId: string; owner: string }) => {
          const balanceOf: BigNumber = await Voter.votes(
            tokenId,
            pair.gaugeAddress
          );
          if (balanceOf.gt(0)) {
            const rewardMultiplierForToken = balanceOf
              .mul(WEI)
              .div(totalGaugeWeight);
            tokenKeys.forEach((tokenKey: string) => {
              if (!allTokenRewards[owner]) {
                allTokenRewards[owner] = {};
              }
              if (!allTokenRewards[owner][tokenKey]) {
                allTokenRewards[owner][tokenKey] = ZERO;
              }
              const tokenMultiplier = BigNumber.from(10).pow(
                rewardData[tokenKey].decimals
              );
              const rewardAmountForToken = BigNumber.from(
                rewardData[tokenKey].amount
              )
                .mul(tokenMultiplier)
                .mul(rewardMultiplierForToken)
                .div(WEI);
              allTokenRewards[owner][tokenKey] =
                allTokenRewards[owner][tokenKey].add(rewardAmountForToken);
              if (!totalRewards[tokenKey]) {
                totalRewards[tokenKey] = ZERO;
              }
              totalRewards[tokenKey] =
                totalRewards[tokenKey].add(rewardAmountForToken);
            });
          }
        }
      );
    }

    console.log(
      "Total Rewards being distributed : ",
      JSON.stringify(totalRewards)
    );

    const totalFilePath = path.join(
      __dirname,
      "output",
      "totalRewardAmts.json"
    );
    fs.writeFileSync(totalFilePath, JSON.stringify(totalRewards));

    const outputFilePath = path.join(__dirname, "output", "rewards.json");
    fs.writeFileSync(outputFilePath, JSON.stringify(allTokenRewards));
    console.log("Done");
  }
);
