import { BigNumber, ethers } from "ethers";
import { DURATION } from "../constants";

export const convertStringToBn = (val: string) => ethers.utils.parseEther(val);

export const convertBnToString = (val: BigNumber) =>
  ethers.utils.formatEther(val);

export const getCurrentEpochTimestamp = (): number =>
  BigNumber.from(Math.floor(Date.now() / 1000))
    .div(DURATION)
    .mul(DURATION)
    .toNumber();
