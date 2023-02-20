import request from "graphql-request";

import { XCAL_EXCHANGE_URI } from "services/graph/config";
import { locksQuery } from "../queries/govern";

const fetcher = async (chainId, query, variables = undefined) => request(XCAL_EXCHANGE_URI[chainId], query, variables);

export const getAccountVeNfts = async (chainId: number, owner: string) => {
  const { locks } = await fetcher(chainId, locksQuery, { owner: owner.toLowerCase() });
  return locks;
};
