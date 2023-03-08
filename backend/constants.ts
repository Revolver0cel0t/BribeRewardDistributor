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

export const MINTER_ADDRESS: AddressMapping = {
  [ChainId.ARBITRUM]: "0x2513DB1B4dAc06CcB03931321292045fdBc573b0",
};

export const EPOCH_FLIPPER_ADDRESS: AddressMapping = {
  [ChainId.ARBITRUM]: "0x7aE6DC970aB9Fe4aa36bA6a3BfA492A90Ba642f4",
};
