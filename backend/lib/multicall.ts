import { Provider } from "ethers-multicall";
import dotenv from "dotenv";
import path from "path";
import { Multicall, ContractCallContext } from "ethereum-multicall";
import { ethers } from "ethers";

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

async function retry(maxRetries: number, fn: any): Promise<any> {
  return fn.catch(async function (err: any) {
    if (maxRetries <= 0) {
      throw err;
    }
    return await retry(maxRetries - 1, fn);
  });
}

export const multicallSplitOnOverflow = async (
  address: string,
  abi: any[],
  multicalls: any[],
  reference: string,
  provider: any,
  options?: {
    maxCallsPerBatch: number;
    blockNumber: string;
  }
): Promise<any[]> => {
  const multicall = new Multicall({
    ethersProvider: provider,
    tryAggregate: true,
  });
  const maxCalls = options?.maxCallsPerBatch ?? 300;
  const calls = [];
  while (multicalls.length > 0) {
    const contractCallContext: ContractCallContext = {
      reference: reference,
      contractAddress: address,
      abi: abi,
      calls: multicalls.splice(0, maxCalls),
    };
    calls.push(
      multicall.call(
        contractCallContext,
        options?.blockNumber
          ? {
              blockNumber: options.blockNumber,
            }
          : {}
      )
    );
  }
  const splitResults = await retry(5, Promise.all(calls));
  return splitResults.flatMap((value: any) => {
    const returns = value.results[reference].callsReturnContext;
    return returns.map(
      ({ returnValues }: { returnValues: any }) => returnValues
    );
  });
};

export const getMulticallProvider = async (provider?: any) => {
  const ethcallProvider = new Provider(provider, 42161);
  return ethcallProvider;
};
