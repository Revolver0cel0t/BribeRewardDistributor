import Web3 from "web3";

export const getGasPrice = async (web3: Web3): Promise<string> => {
  const gasPrice = await web3.eth.getGasPrice();
  const gasPriceInGwei = web3.utils.fromWei(gasPrice, "gwei");
  return gasPriceInGwei;
};
