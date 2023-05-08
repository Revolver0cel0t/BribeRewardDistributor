import request from "graphql-request";
import {
  allLocksQuery,
  allPairDataQuerySwap,
  allPairDataQuerySwapWithGauge,
  allUsersQuery,
  liqSnapshotsQuery,
  tokenDayDatasQuery,
} from "./queries";
import { ethers } from "ethers";
import { Token } from "../scripts/calculateAirdrop";

const fetcher = async (
  network: string,
  query: any,
  variables: any = undefined
) => {
  const ENDPOINT = {
    arbitrumOne:
      "https://api.thegraph.com/subgraphs/name/revolver0cel0t/xcal-arbitrum",
    local:
      "https://api.thegraph.com/subgraphs/name/revolver0cel0t/xcal-arbitrum",
  }[network];
  return request(ENDPOINT || "", query, variables);
};

export const getLocks = async (network: any, blockNumber?: number) => {
  let paginationRequired = true;
  let data: any = [];
  let skip = 0;
  while (paginationRequired) {
    const { locks } = await fetcher(network, allLocksQuery, {
      skip: skip++ * 1000,
      blockNumber: Number(blockNumber),
    });
    if (locks.length === 0) paginationRequired = false;
    data = [...data, ...locks];
  }
  return data;
};

export const getUsers = async (network: any) => {
  let paginationRequired = true;
  let data: any = [];
  let skip = 0;
  while (paginationRequired) {
    const { users } = await fetcher(network, allUsersQuery, {
      skip: skip++ * 1000,
    });
    if (users.length === 0) paginationRequired = false;
    data = [...data, ...users];
  }
  return data;
};

export const allSwapPairs = async (network: any) => {
  const { pairs: data } = await fetcher(
    network,
    allPairDataQuerySwap,
    undefined
  );
  return data;
};

export const allPairDataSwapWithGauge = async (network: any) => {
  const { pairs: data } = await fetcher(
    network,
    allPairDataQuerySwapWithGauge,
    undefined
  );
  return data;
};

export const getTokenPriceUSD = async (
  network: any,
  blockTimestamp: number,
  token: Token
) => {
  const { tokenDayDatas } = await fetcher(network, tokenDayDatasQuery, {
    token: token.address,
    blockTimestamp,
  });

  const splitString = (tokenDayDatas[0].priceUSD as string).split(".");
  splitString[1] = splitString[1] ? splitString[1].slice(0, 18) : "0";
  return ethers.utils.parseUnits(splitString[0] + "." + splitString[1], 18);
};

export const getLiqSnapshotsForPair = async (
  network: any,
  blockNumber: number,
  endblocknumber: number,
  pair: string
) => {
  let paginationRequired = true;
  let data: any = [];
  let skip = 0;
  while (paginationRequired) {
    const { liquidityPositionSnapshots } = await fetcher(
      network,
      liqSnapshotsQuery,
      {
        skip: skip++ * 1000,
        blockNumber: Number(blockNumber),
        endblock: Number(endblocknumber),
        pair,
      }
    );
    if (liquidityPositionSnapshots.length === 0) paginationRequired = false;
    data = [...data, ...liquidityPositionSnapshots];
  }
  return data;
};
