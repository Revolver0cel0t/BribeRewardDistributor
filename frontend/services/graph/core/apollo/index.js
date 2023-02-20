import { useMemo } from "react";
import { ApolloClient } from "@apollo/client";
import merge from "lodash.merge";

import cache from "./cache";
import link, { xcali } from "./link";
import { ChainId } from "stores/constants";
import useActiveWeb3React from "hooks/useActiveWeb3React";

function customizer(objValue, srcValue) {
  if (_.isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}

let apolloClient;

function createApolloClient(chainId) {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    connectToDevTools: typeof window !== "undefined" && process.NODE_ENV === "development",
    link: link(chainId),
    cache,
  });
}

export function getXCaliClient(chainId = ChainId.ARBITRUM) {
  const link = xcali[chainId];
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    connectToDevTools: typeof window !== "undefined" && process.NODE_ENV === "development",
    link,
    cache,
  });
}

export function getApollo(initialState = null, chainId) {
  const _apolloClient = createApolloClient(chainId);
  _apolloClient.setLink(link(chainId));

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Combine
    const data = merge(initialState, existingCache);

    _apolloClient.cache.restore(data);
  }

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") {
    return _apolloClient;
  }

  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function useApollo(initialState, chainId) {
  const store = useMemo(() => getApollo(initialState, chainId), [initialState, chainId]);
  return store;
}

export * from "./variables";
