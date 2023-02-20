import BigNumber from "bignumber.js";
import { request } from "graphql-request";
import { XCAL_EXCHANGE_URI } from "services/graph/config";
import {
  allPairDataQuerySwap,
  creditPairData,
  ethPriceQuery,
  pairDayDatasQuery,
  reserveDataSwap,
  subgraphTokenPricing,
  tokenPriceETHQuery,
  uniswapDayDatas,
  uniswapFactoryQuery,
} from "../queries";

const fetcher = async (chainId, query, variables = undefined) => request(XCAL_EXCHANGE_URI[chainId], query, variables);

export const getPoolVolumeChart = async (chainId, pairs) => {
  const { pairDayDatas } = await fetcher(chainId, pairDayDatasQuery, { pairs });
  return pairDayDatas;
};

export const getTokenPricesFromSubgraph = async (chainId, addresses) => {
  const { tokens } = await fetcher(chainId, subgraphTokenPricing, {
    addresses: addresses.map(address => address.toLowerCase()),
  });
  return tokens;
};

export const getETHPrice = async chainId => {
  const { bundle } = await fetcher(chainId, ethPriceQuery);

  return bundle.ethPrice;
};

export const getTokenPrice = async (chainId, address) => {
  try {
    const { bundle, token } = await fetcher(chainId, tokenPriceETHQuery, { id: address });

    return new BigNumber(bundle.ethPrice).times(token.derivedETH).toFixed();
  } catch (error) {
    return undefined;
  }
};

export const getPoolSpecificData = async (chainId, pairs) => {
  const { pairDayDatas } = await fetcher(chainId, pairDayDatasQuery, { pairs });
  return pairDayDatas;
};

export const getTotalDexData = async chainId => {
  const { swapFactories } = await fetcher(chainId, uniswapFactoryQuery, undefined);
  return swapFactories[0];
};

export const getDexData = async chainId => {
  const { uniswapDayDatas: data } = await fetcher(chainId, uniswapDayDatas, undefined);
  return data;
};

export const getTokenSummary = async chainId => {
  const { uniswapDayDatas: data } = await fetcher(chainId, uniswapDayDatas, undefined);
  return data;
};

export const allPairsSwap = async chainId => {
  const { pairs: data } = await fetcher(chainId, allPairDataQuerySwap[chainId], undefined);
  return data;
};

export const getPairDayDataSwap = async (chainId, address) => {
  const data = await fetcher(chainId, reserveDataSwap, { address });
  return data;
};

export const allPairsCredit = async chainId => {
  const { pairs: data } = await fetcher(chainId, creditPairData, {
    maturity: "0",
  });
  return data;
};
