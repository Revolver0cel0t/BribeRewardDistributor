import { task } from "hardhat/config";
import fs from "fs";
import path from "path";
//@ts-ignore
import { BigNumber, Contract } from "ethers";
import VOTER_ABI from "../../constants/abis/voterABI.json";
import MINTER_ABI from "../../constants/abis/minterABI.json";
import GAUGE_ABI from "../../constants/abis/gaugeABI.json";
import EPOCH_FLIPPER_ABI from "../../constants/abis/epochFlipperABI.json";
import { allSwapPairs } from "../../subgraph/fetchers";
import {
  VOTER_ADDRESS,
  MINTER_ADDRESS,
  EPOCH_FLIPPER_ADDRESS,
  GOV_TOKEN_ADDRESS,
} from "../../constants";
import { getAddress } from "ethers/lib/utils";
import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";
import { Network } from "hardhat/types";

const getPairData = (pair: any) => ({
  name:
    (Boolean(pair.stable) ? "sAMM" : "vAMM") +
    "-" +
    pair.token0.symbol +
    "-" +
    pair.token1.symbol,
  gaugeAddress: pair.gaugeAddress,
  address: pair.address,
});

async function distributeFees(swapPairs: any[], voterContract: Contract) {
  let errorPairs = [];
  for (let index = 0; index < swapPairs.length; index++) {
    const pair = swapPairs[index];
    try {
      await voterContract.distributeFees([getAddress(pair.gaugeAddress)]);
    } catch (error) {
      console.log(error);
      errorPairs.push(getPairData(pair));
    }
  }
  return errorPairs;
}

async function distributeEmissions(swapPairs: any[], voterContract: Contract) {
  let errorPairs: any[] = [];
  for (let index = 0; index < swapPairs.length; index++) {
    try {
      await voterContract.distribute(index, index + 1);
    } catch (error) {
      console.log(error);
      const gaugeAddress = await voterContract.allGauges(index);
      const pair = swapPairs.filter(
        (pair) => pair.gaugeAddress.toLowerCase() === gaugeAddress.toLowerCase()
      )[0];
      errorPairs.push(getPairData(pair));
    }
  }
  return errorPairs;
}

async function getRewardRates(
  swapPairs: any[],
  ethers: typeof import("/Users/rev/BribeRewardDistributor/backend/node_modules/ethers/lib/ethers") &
    HardhatEthersHelpers
) {
  let rewardRates: any = {};
  for (let index = 0; index < swapPairs.length; index++) {
    try {
      const pair = swapPairs[index];
      const gaugeContract = await ethers.getContractAt(
        GAUGE_ABI,
        pair.gaugeAddress
      );
      const rewardRate: BigNumber = await gaugeContract.rewardRate(
        GOV_TOKEN_ADDRESS[42161]
      );
      rewardRates[pair.gaugeAddress] = rewardRate.toString();
    } catch (error) {}
  }
  return rewardRates;
}

async function boostEmissions(swapPairs: any[], epochFlipper: Contract) {
  let errorPairs = [];
  const boostedEmissionsFilePath = path.join(
    __dirname,
    "input",
    "boostedEmissionAmounts.json"
  );
  const boostedEmissionData = JSON.parse(
    fs.readFileSync(boostedEmissionsFilePath).toString()
  );
  const gauges = boostedEmissionData.gauges ?? [];
  const amounts = boostedEmissionData.boostedAmounts ?? [];
  for (let index = 0; index < gauges.length; index++) {
    try {
      await epochFlipper.updateNextEpochData(
        "0",
        [getAddress(gauges[index])],
        [amounts[index]]
      );
      await epochFlipper.boostSelectedGauges();
    } catch (error) {
      console.log(error);
      const pair = swapPairs.filter(
        (pair) =>
          pair.gaugeAddress.toLowerCase() === gauges[index].toLowerCase()
      )[0];
      errorPairs.push(getPairData(pair));
    }
  }
  return errorPairs;
}

export async function flipEpoch(
  network: Network,
  ethers: typeof import("/Users/rev/BribeRewardDistributor/backend/node_modules/ethers/lib/ethers") &
    HardhatEthersHelpers
) {
  const chainId = 42161;
  const minter = await ethers.getContractAt(
    MINTER_ABI,
    MINTER_ADDRESS[chainId]
  );
  const voter = await ethers.getContractAt(VOTER_ABI, VOTER_ADDRESS[chainId]);
  const epochFlipper = await ethers.getContractAt(
    EPOCH_FLIPPER_ABI,
    EPOCH_FLIPPER_ADDRESS[chainId]
  );

  //firstly, update period
  await minter.update_period();

  console.log("period updated");

  //retrieve all the swap pairs with gauges
  const swapPairs = await allSwapPairs(network.name);

  //distribute Fees, also retrieve error pairs
  const feeErrorPairs = await distributeFees(swapPairs, voter);
  console.log("fees distributed");
  //distribute Emissions, also retrieve error pairs
  const emissionErrorPairs = await distributeEmissions(swapPairs, voter);
  console.log("emissions distributed");

  //boost Emissions, also retrieve error pairs
  const boostErrorPairs = await boostEmissions(swapPairs, epochFlipper);
  console.log("boost distributed");

  const errorPairs = {
    feeErrorPairs,
    emissionErrorPairs,
    boostErrorPairs,
  };
  console.log(errorPairs);
  const errorFilePath = path.join(__dirname, "output", "errorsPairs.json");
  fs.writeFileSync(errorFilePath, JSON.stringify(errorPairs));
  console.log("error pairs stored");

  const rewardRates = await getRewardRates(swapPairs, ethers);
  const rewardRateFilePath = path.join(__dirname, "output", "rewardRates.json");
  fs.writeFileSync(rewardRateFilePath, JSON.stringify(rewardRates));
  console.log("reward rates calculated");

  console.log("Done, check output folder to check for error Pairs");
}

task("flip-epoch", "").setAction(async (_, { network, ethers }) => {
  await flipEpoch(network, ethers);
});

task("calculate-reward-rate", "").setAction(async (_, { network, ethers }) => {
  //retrieve all the swap pairs with gauges
  const swapPairs = await allSwapPairs(network.name);
  const rewardRates = await getRewardRates(swapPairs, ethers);
  const rewardRateFilePath = path.join(__dirname, "output", "rewardRates.json");
  fs.writeFileSync(rewardRateFilePath, JSON.stringify(rewardRates));
  console.log("reward rates calculated");
});
