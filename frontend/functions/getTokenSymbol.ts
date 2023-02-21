import Web3 from "web3";
import { AbiItem } from "web3-utils";
import ERC_20_ABI from "stores/abis/erc20.json";

export const getTokenInfo = async (
  web3: Web3,
  address: string
): Promise<{ symbol: string; decimals: number }> => {
  const tokenContract = new web3.eth.Contract(ERC_20_ABI as AbiItem[], address);
  const symbol = await tokenContract.methods.symbol().call();
  const decimals = Number(await tokenContract.methods.decimals().call());

  return {
    symbol,
    decimals,
  };
};
