import { task } from "hardhat/config";
import fs from "fs";
import path from "path";
//@ts-ignore
import eachLimit from "async/eachLimit";
import { BigNumber } from "ethers";
import { Contract } from "ethers-multicall";
import VE_ABI from "../../constants/abis/veABI.json";
import VOTER_ABI from "../../constants/abis/voterABI.json";
import { allSwapPairs, getLocks } from "../../subgraph/fetchers";
import { VE_ADDRESS, VOTER_ADDRESS, WEI, ZERO } from "../../constants";
import {
  getMulticallProvider,
  multicallSplitOnOverflow,
} from "../../lib/multicall";
import { getCurrentEpochTimestamp } from "../../utils";
import axios from "axios";
import { getAddress } from "ethers/lib/utils";

Object.defineProperties(BigNumber.prototype, {
  toJSON: {
    value: function (this: BigNumber) {
      return this.toString();
    },
  },
});

async function getMultipleWeights(
  locks: any[],
  pair: any,
  chainId: number,
  provider: any
) {
  const weightCalls = locks.map(({ tokenId }: { tokenId: number }) => ({
    methodName: "votes(uint256,address)",
    methodParameters: [tokenId, pair.gaugeAddress],
  }));
  const results = await multicallSplitOnOverflow(
    VOTER_ADDRESS[chainId],
    VOTER_ABI,
    weightCalls,
    "Voter",
    provider,
    {
      maxCallsPerBatch: 300,
      blockNumber: "65886487",
    }
  );
  const convertedResults = results.map((result) =>
    BigNumber.from(result[0].hex)
  );
  return convertedResults;
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
    const chainId = 42161;
    const bribesFilePath = path.join(__dirname, "input", "bribes.json");
    const bribeInputs = JSON.parse(fs.readFileSync(bribesFilePath).toString());
    const [Voter, pairs, locks] = await Promise.all([
      ethers.getContractAt(VOTER_ABI, VOTER_ADDRESS[chainId]),
      allSwapPairs(network.name),
      getLocks(network.name, 65886487),
    ]);
    let allTokenRewards: Record<string, Record<string, BigNumber>> = {};
    let totalRewards: Record<string, BigNumber> = {};

    // console.log("Fecthing unexpired locks");
    // const unexpiredLocks = await getAllUnexpiredLocks(
    //   lockData,
    //   chainId,
    //   provider
    // );

    // console.log("Fecthing lock information");
    // const locks = await getFullDataForTokens(unexpiredLocks, chainId, provider);

    console.log({ locks: locks.length, pairs: pairs.length });

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const rewardData = bribeInputs[getAddress(pair.bribe.address)];
      if (!rewardData) continue;

      console.log("Fecthing gauge weight");
      const totalGaugeWeight: BigNumber = await Voter.weights(
        pair.gaugeAddress,
        { blockTag: 65886487 }
      );
      const tokenKeys = Object.keys(rewardData);

      console.log(
        `= start - ${i} - ${pair.stable ? "sAMM" : "vAMM"}-${
          pair.token0.symbol
        }/${pair.token1.symbol}`
      );

      console.log("Fecthing weights for locks ");
      const allWeights = await getMultipleWeights(
        locks,
        pair,
        chainId,
        ethers.provider
      );
      locks.forEach(
        ({ owner: smallOwner }: { owner: string }, index: number) => {
          const owner = getAddress(smallOwner);
          const balanceOf = allWeights[index];
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
