import { BigNumber } from "ethers";

enum ChainId {
  ARBITRUM = 42161,
}

type AddressMapping = { [chainId: number]: string };

export const WEI = BigNumber.from(10).pow(18);

export const ZERO = BigNumber.from("0");

export const DURATION = 604800; // 7 days in seconds

export const VE_ADDRESS: AddressMapping = {
  [ChainId.ARBITRUM]: "0x50aACeD9396405D1410DCb8974a6c30B9757A4f7",
};

export const VOTER_ADDRESS: AddressMapping = {
  [ChainId.ARBITRUM]: "0xE6CCdC80c4838B670c94DA07E8338589dEc5E628",
};
