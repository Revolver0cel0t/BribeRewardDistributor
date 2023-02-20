import { XCAL_EXCHANGE_URI } from "services/graph/config";
import { locksQuery } from "../queries/exchange";
import { request } from "graphql-request";

const fetcher = async (chainId, query, variables = undefined) => request(XCAL_EXCHANGE_URI[chainId], query, variables);

export const getLatestTokenId = async chainId => {
  const { locks } = await fetcher(chainId, locksQuery);

  return locks[0].tokenId;
};
