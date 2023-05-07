import { ethers } from "ethers";
import { Provider } from "ethers-multicall";
import dotenv from "dotenv";
import path from "path";
import {
  Multicall,
  ContractCallResults,
  ContractCallContext,
} from "ethereum-multicall";

let provider = ethers.getDefaultProvider();

// you can use any ethers provider context here this example is
// just shows passing in a default provider, ethers hold providers in
// other context like wallet, signer etc all can be passed in as well.
const multicall = new Multicall({
  ethersProvider: provider,
  tryAggregate: true,
});

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
  address,
  abi,
  multicalls,
  reference,
  provider,
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
        options
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
    return returns.map(({ returnValues }) => returnValues);
  });
};

export const getMulticallProvider = async (chainId: number, provider?: any) => {
  const providers = new ethers.providers.AlchemyProvider(
    chainId,
    process.env.ALCHEMY_API_KEY
  );
  const ethcallProvider = new Provider(provider, 42161);
  return ethcallProvider;
};
