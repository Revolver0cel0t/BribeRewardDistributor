import request from "graphql-request";
import { allLocksQuery, allPairDataQuerySwap } from "./queries";

const fetcher = async (
  network: string,
  query: any,
  variables: any = undefined
) => {
  const ENDPOINT = {
    arbitrumOne:
      "https://api.thegraph.com/subgraphs/name/revolver0cel0t/3xcalibur-arbitrum",
    local:
      "https://api.thegraph.com/subgraphs/name/revolver0cel0t/3xcalibur-arbitrum",
  }[network];
  return request(ENDPOINT || "", query, variables);
};

//gets all locks, paginate if required
export const getLocks = async (network: any, blockNumber?: number) => {
  let paginationRequired = true;
  let data: any = [];
  let skip = 0;
  while (paginationRequired) {
    const { locks } = await fetcher(network, allLocksQuery, {
      skip: skip++ * 1000,
    });
    if (locks.length === 0) paginationRequired = false;
    data = [...data, ...locks];
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
