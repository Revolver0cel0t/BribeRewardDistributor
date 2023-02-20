import { SWRConfiguration } from "swr";
import { ChainId } from "stores/constants";

export const GRAPH_BAR_URI = "https://api.thegraph.com/subgraphs/name/traderjoe-xyz/bar";
export const GRAPH_MASTERCHEF_URI = "https://api.thegraph.com/subgraphs/name/traderjoe-xyz/masterchefv2";
// @TODO: replace this with 3six9's subgraph when deployed
export const GRAPH_EXCHANGE_URI = "https://api.thegraph.com/subgraphs/name/spartacus-finance/solidly";
export const GRAPH_BLOCKS_URI = "https://api.thegraph.com/subgraphs/name/dasconnor/avalanche-blocks";
export const GRAPH_LENDING_URI = "https://api.thegraph.com/subgraphs/name/traderjoe-xyz/lending";
export const XCAL_EXCHANGE_URI = {
  5: "https://api.thegraph.com/subgraphs/name/0xleez/xcali-goerli",
  250: "https://api.thegraph.com/subgraphs/name/spartacus-finance/solidly",
  [ChainId.ARBITRUM_GOERLI]: "https://api.thegraph.com/subgraphs/name/0xleez/xcali-arbitrum-goerli-2",
  [ChainId.ARBITRUM]: "https://api.thegraph.com/subgraphs/name/0xleez/xcali-arbitrum",
};

export const XCALI_ARBITRUM_URI = "https://api.thegraph.com/subgraphs/name/0xleez/xcali-arbitrum";
export const XCALI_GOERLI_URI = "https://api.thegraph.com/subgraphs/name/0xleez/xcali-goerli";
export const XCALI_ARBITRUM_GOERLI_URI = "https://api.thegraph.com/subgraphs/name/0xleez/xcali-arbitrum-goerli";

export const FACTORY_ADDRESS = "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10".toLowerCase();
export const JOE_TOKEN_ADDDRESS = "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd".toLowerCase();
export const MASTERCHEF_ADDRESS = "0xd6a4F121CA35509aF06A0Be99093d08462f53052".toLowerCase();
export const BAR_ADDRESS = "0x57319d41F71E81F3c65F2a47CA4e001EbAFd4F33".toLowerCase();
export const LENDING_ADDRESS = "0x3d5BC3c8d13dcB8bF317092d84783c2697AE9258".toLowerCase();

export const swrConfig: SWRConfiguration = {
  refreshInterval: 600000,
  revalidateOnFocus: false,
  focusThrottleInterval: 600000,
  dedupingInterval: 600000,
};
