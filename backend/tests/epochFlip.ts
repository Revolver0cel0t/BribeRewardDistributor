import { mineUpTo } from "@nomicfoundation/hardhat-network-helpers";
import { getCurrentEpochTimestamp } from "../utils";
import { BigNumber } from "ethers";
import { DURATION, EPOCH_FLIPPER_ADDRESS } from "../constants";
import { flipEpoch } from "../scripts/epochFlip";
import { ethers, network } from "hardhat";
import ERC20_ABI from "../constants/abis/erc20ABI.json";
import { Suite } from "mocha";

describe("Flip epoch", async () => {
  before(async () => {
    const nextEpoch = BigNumber.from(getCurrentEpochTimestamp()).add(DURATION);
    mineUpTo(nextEpoch);
  });

  it("flip epoch", async function () {
    console.log("here now");
    await flipEpoch({ name: "arbitrumOne" }, ethers);
  });
});
