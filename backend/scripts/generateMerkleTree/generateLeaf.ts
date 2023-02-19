import { keccak256 } from "@ethersproject/solidity";

export const generateLeaf = (
  tokens: string[],
  amounts: string[],
  toAddress: string
) => {
  return keccak256(
    ["address[]", "uint256[]", "address"],
    [tokens, amounts, toAddress]
  );
};
