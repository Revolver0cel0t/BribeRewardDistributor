import { task } from "hardhat/config";
import fs from "fs";
import path from "path";
import { BigNumber } from "ethers";
import VOTER_ABI from "../../constants/abis/voterABI.json";
import { allSwapPairs, getLocks } from "../../subgraph/fetchers";
import { VOTER_ADDRESS, WEI, ZERO } from "../../constants";
import { multicallSplitOnOverflow } from "../../lib/multicall";
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
  provider: any,
  blocknumber: string
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
      blockNumber: blocknumber,
    }
  );
  const convertedResults = results.map((result) =>
    BigNumber.from(result[0].hex)
  );
  return convertedResults;
}

task("get-block-number-for-epoch-start")
  .addParam("blocktimestamp", "Block Timestamp")
  .setAction(async ({ blocktimestamp }) => {
    const result = await axios.get(
      `https://coins.llama.fi/block/arbitrum/${blocktimestamp}`
    );

    console.log("Block number", result.data.height);
  });

task("calculate-bribe-rewards", "")
  .addParam("blocknumber", "Block Number")
  .setAction(async ({ blocknumber }, { network, ethers }) => {
    const chainId = 42161;
    const bribesFilePath = path.join(__dirname, "input", "bribes.json");
    const bribeInputs = JSON.parse(fs.readFileSync(bribesFilePath).toString());
    const [pairs, locks] = await Promise.all([
      allSwapPairs(network.name),
      getLocks(network.name, blocknumber),
    ]);
    let allTokenRewards: Record<string, Record<string, BigNumber>> = {};
    let totalRewards: Record<string, BigNumber> = {};

    const tokenKeys = Object.keys(bribeInputs);

    let distroAmts: any = {};
    tokenKeys.forEach((key) => {
      Object.keys(bribeInputs[key]).forEach((val) => {
        if (!distroAmts[val]) {
          distroAmts[val] = "0";
        }
        distroAmts[val] = BigNumber.from(distroAmts[val])
          .add(bribeInputs[key][val].amount)
          .toString();
      });
    });

    console.log("Total amounts to distro : ", distroAmts);
    console.log("Total pairs to calc for : ", tokenKeys.length);

    console.log({ locks: locks.length, pairs: pairs.length });

    let totalPairs = 0;
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const rewardData = bribeInputs[getAddress(pair.bribe.address)];
      if (!rewardData) continue;
      totalPairs++;
      console.log("Fecthing gauge weight");
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
        ethers.provider,
        blocknumber
      );
      const totalGaugeWeight = allWeights.reduce(
        (prev, acc) => prev.add(acc),
        BigNumber.from(0)
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

    console.log("Total pairs calculated for : ", totalPairs);

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
  });
