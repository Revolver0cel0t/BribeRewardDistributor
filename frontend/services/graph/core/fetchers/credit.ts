import request from "graphql-request";
import { XCAL_EXCHANGE_URI } from "services/graph/config";
import {
  borrowCDTsQuery,
  activeLendingPairsQuery,
  lendingPairQuery,
  lendingPairWithPoolsQuery,
  lendingPairUsingTokens,
} from "../queries/credit";
import { CONTRACTS } from "stores/constants";
import { ChainId } from "stores/constants";

const fetcher = async (chainId, query, variables = undefined) => request(XCAL_EXCHANGE_URI[chainId], query, variables);

export const getLendingPairs = async (chainId, opts: any = {}) => {
  const active = opts?.active ?? false;
  const now = new Date();
  const beginning = new Date("2022-05-01"); // all pairs
  const minMaturity = Math.round((active ? now : beginning).getTime() / 1000);
  const { lendingPairs } = await fetcher(chainId, activeLendingPairsQuery, { minMaturity });
  return lendingPairs
    .filter(pair => Boolean(pair.pools.length))
    .map(pair => ({
      ...pair,
      asset: _getTokenOrNative(pair.asset, chainId),
      collateral: _getTokenOrNative(pair.collateral, chainId),
    }));
};

export const getLendingPair = async (pairAddress, opts) => {
  const chainId = opts.chainId || ChainId.ARBITRUM;
  const withPools = opts.withPools === undefined ? true : opts.withPools;

  const { lendingPair: pair } = await fetcher(chainId, withPools ? lendingPairWithPoolsQuery : lendingPairQuery, {
    id: pairAddress.toLowerCase(),
  });
  return {
    ...pair,
    asset: _getTokenOrNative(pair.asset, chainId),
    collateral: _getTokenOrNative(pair.collateral, chainId),
  };
};

export const getMaturitiesForLendingPair = async (asset, collateral, opts) => {
  const chainId = opts.chainId || ChainId.ARBITRUM;

  const { lendingPairs: pair } = await fetcher(chainId, lendingPairUsingTokens, {
    asset: asset.address.toLowerCase(),
    collateral: collateral.address.toLowerCase(),
  });

  return pair[0].pools.map(pool => pool.maturity);
};

export const getAccountBorrowCDTs = async (account, chainId) => {
  const { collateralizedDebtTokens } = await fetcher(chainId, borrowCDTsQuery, {
    user: account.toLowerCase(),
  });
  // @TODO: graph doesn't support filtering nested values, but it's on their roadmap.
  // update this when feature comes live
  const expiredAfter = Math.round(new Date().getTime() / 1000) - 3600 * 24 * 30; // 1 month ago
  return collateralizedDebtTokens
    .filter(cdt => Number(cdt.pool.maturity) > expiredAfter)
    .map(cdt => ({
      ...cdt,
      pool: {
        ...cdt.pool,
        pair: {
          ...cdt.pool.pair,
          asset: _getTokenOrNative(cdt.pool.pair.asset, chainId),
          collateral: _getTokenOrNative(cdt.pool.pair.collateral, chainId),
        },
      },
    }));
};

const _getTokenOrNative = (token, chainId: number) => {
  return token.address === CONTRACTS.WFTM_ADDRESS[chainId].toLowerCase()
    ? {
        decimals: 18,
        name: CONTRACTS.FTM_NAME[chainId],
        symbol: CONTRACTS.FTM_SYMBOL[chainId],
        address: CONTRACTS.FTM_ADDRESS[chainId],
      }
    : token;
};
