import { request } from "graphql-request";
import { XCAL_EXCHANGE_URI } from "services/graph/config";
import { multiswapChartInfoQuery, singleSwapChartInfoQuery, swapInfoQuery, topTokensQuery } from "../queries";

const fetcher = async (chainId, query, variables = undefined) => request(XCAL_EXCHANGE_URI[chainId], query, variables);

export const getSwapInfo = async (chainId, id) => {
  const { tokenOldPrice, currentDayData } = await fetcher(chainId, swapInfoQuery, { id });
  return {
    data: {
      tokenOldPrice,
      currentDayData,
    },
  };
};

export const getTopTokens = async chainId => {
  const { tokens } = await fetcher(chainId, topTokensQuery);
  return {
    data: { tokens },
  };
};

export const getSingleSwapCharts = async (chainId, tokenA, tokenB) => {
  const { tokenAData, tokenBData } = await fetcher(chainId, singleSwapChartInfoQuery, { tokenA, tokenB });
  return {
    data: { tokenAData, tokenBData },
  };
};

export const getMultiSwapCharts = async (chainId, addresses) => {
  const { token0, token1, token2, token3, token4 } = await fetcher(chainId, multiswapChartInfoQuery, {
    address0: addresses[0],
    address1: addresses[1],
    address2: addresses[2],
    address3: addresses[3],
    address4: addresses[4],
  });
  return {
    data: { token0, token1, token2, token3, token4 },
  };
};
