import { HttpLink, from } from "@apollo/client";
import { RetryLink } from "@apollo/client/link/retry";

import { ChainId } from "stores/constants";
import {
  GRAPH_BAR_URI,
  GRAPH_MASTERCHEF_URI,
  XCALI_ARBITRUM_GOERLI_URI,
  GRAPH_BLOCKS_URI,
  GRAPH_LENDING_URI,
  XCALI_GOERLI_URI,
  XCALI_ARBITRUM_URI,
} from "../../config/index.ts";

export const EXCHANGE_URI = {
  5: "https://api.thegraph.com/subgraphs/name/0xleez/xcali-goerli",
  250: "https://api.thegraph.com/subgraphs/name/spartacus-finance/solidly",
  [ChainId.ARBITRUM_GOERLI]: "https://api.thegraph.com/subgraphs/name/0xleez/xcali-arbitrum-goerli",
};

export const uniswap = from([
  new RetryLink(),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
    shouldBatch: true,
  }),
]);

export const bar = from([
  new RetryLink(),
  new HttpLink({
    uri: GRAPH_BAR_URI,
    shouldBatch: true,
  }),
]);

export const masterchef = from([
  new RetryLink(),
  new HttpLink({
    uri: GRAPH_MASTERCHEF_URI,
    shouldBatch: true,
  }),
]);

export const market = from([
  new RetryLink(),
  new HttpLink({
    uri: GRAPH_LENDING_URI,
    shouldBatch: true,
  }),
]);

export const blocklytics = from([
  new RetryLink(),
  new HttpLink({
    uri: GRAPH_BLOCKS_URI,
    shouldBatch: true,
  }),
]);

export const lockup = from([
  new RetryLink(),
  new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/matthewlilley/lockup",
    shouldBatch: true,
  }),
]);

const exchange = chainId => {
  return from([
    new RetryLink(),
    new HttpLink({
      uri: EXCHANGE_URI[chainId],
      shouldBatch: true,
    }),
  ]);
};

export const xcali = {
  [ChainId.ARBITRUM]: from([
    new RetryLink(),
    new HttpLink({
      uri: XCALI_ARBITRUM_URI,
      shouldBatch: true,
    }),
  ]),
  [ChainId.GOERLI]: from([
    new RetryLink(),
    new HttpLink({
      uri: XCALI_GOERLI_URI,
      shouldBatch: true,
    }),
  ]),
  [ChainId.ARBITRUM_GOERLI]: from([
    new RetryLink(),
    new HttpLink({
      uri: XCALI_ARBITRUM_GOERLI_URI,
      shouldBatch: true,
    }),
  ]),
};
export default exchange;
