import useSWR from "swr";
import { useApollo } from "../apollo";
import { swrConfig } from "services/graph/config";
import { useMemo } from "react";
import { CONTRACTS } from "stores/constants";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { getMultiSwapCharts, getSingleSwapCharts, getSwapInfo, getTopTokens } from "../fetchers/swap";

export function useSwapInfo(id = "") {
  const { chainId } = useActiveWeb3React();
  const client = useApollo(undefined, chainId);
  const { data } = useSWR(
    ["swapInfo", id, client, chainId],
    async () => {
      return await getSwapInfo(chainId, id.toLowerCase());
    },
    swrConfig,
  );

  return data;
}

export function useTopTokens() {
  const { chainId } = useActiveWeb3React();
  const client = useApollo(undefined, chainId);
  const { data } = useSWR(
    ["topTokens", client, chainId],
    async () => {
      const data = await getTopTokens(chainId);
      if (data?.data?.tokens) {
        return data?.data?.tokens;
      }
      return undefined;
    },
    swrConfig,
  );

  return data;
}

export function useSingleSwapCharts(tokenA = "", tokenB = "") {
  const { chainId } = useActiveWeb3React();
  const { data } = useSWR(
    ["singleSwapCharts", JSON.stringify({ tokenA, tokenB, chainId })],
    async () => {
      const data = await getSingleSwapCharts(chainId, tokenA, tokenB);
      return data;
    },
    swrConfig,
  );

  return data;
}

export function useMultiSwapCharts(tokens = []) {
  const { chainId } = useActiveWeb3React();
  const addresses = useMemo(() => {
    const addArray = [];
    for (let i = 0; i < 5; i++) {
      addArray.push(
        tokens?.[i]?.address === CONTRACTS.NATIVE_ADDRESS[chainId]
          ? CONTRACTS.WFTM_ADDRESS[chainId]?.toLowerCase()
          : tokens?.[i]?.address?.toLowerCase() ?? "",
      );
    }
    return addArray;
  }, [chainId, tokens]);

  const { data } = useSWR(
    ["multiswapCharts", JSON.stringify(addresses)],
    async () => {
      const data = await getMultiSwapCharts(chainId, addresses);
      return data;
    },
    swrConfig,
  );

  return data;
}
