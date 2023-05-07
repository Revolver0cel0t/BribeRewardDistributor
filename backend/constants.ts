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

export const GOV_TOKEN_ADDRESS = {
  250: "0x888EF71766ca594DED1F0FA3AE64eD2941740A20",
  5: "0x33485361fB901745f8979dB0458AD516E935aea6",
  [ChainId.ARBITRUM]: "0xd2568acCD10A4C98e87c44E9920360031ad89fCB",
};
