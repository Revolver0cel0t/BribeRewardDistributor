import { ethers } from "ethers";
import { Provider } from "ethers-multicall";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

export const multicallSplitOnOverflow = async (
  multicallData: any[],
  provider: Provider,
  options?: {
    maxCallsPerBatch: number;
  }
): Promise<any[]> => {
  const maxCalls = options?.maxCallsPerBatch ?? 300;
  const calls = [];
  while (multicallData.length > 0) {
    calls.push(provider.all(multicallData.splice(0, maxCalls)));
  }
  const splitResults = await Promise.all(calls);
  return splitResults.flatMap((value) => value);
};

export const getMulticallProvider = async (chainId: number) => {
  const provider = new ethers.providers.AlchemyProvider(
    chainId,
    process.env.ALCHEMY_API_KEY
  );
  const ethcallProvider = new Provider(provider);
  await ethcallProvider.init();
  return ethcallProvider;
};
