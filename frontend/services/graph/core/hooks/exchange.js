import { useEffect, useState } from "react";
import { retry } from "../../../../functions/retry";
import { useApollo } from "../apollo";
import stringify from "fast-json-stable-stringify";
import useSWR from "swr";
import { swrConfig } from "services/graph/config";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import {
  getDexData,
  getPoolSpecificData,
  getPoolVolumeChart,
  getTokenSummary,
  getTotalDexData,
} from "../fetchers/exchange";

export function usePoolVolumeChart(pairs = []) {
  const { chainId } = useActiveWeb3React();
  const { data } = useSWR(
    chainId && ["poolVolume", stringify(pairs)],
    async () => {
      if (pairs.length > 0 && pairs[0]) {
        return await getPoolVolumeChart(chainId, pairs);
      }
    },
    swrConfig,
  );

  return data;
}

export function usePoolSpecificData(pairs = []) {
  const { chainId } = useActiveWeb3React();
  const { data } = useSWR(
    chainId && ["poolSpecific", stringify(pairs)],
    async () => {
      if (pairs.length > 0 && pairs[0]) {
        return await getPoolSpecificData(chainId, pairs);
      }
    },
    swrConfig,
  );

  return data;
}

export function useTotalDexData() {
  const { chainId } = useActiveWeb3React();
  const { data } = useSWR(chainId && ["totalDexData"], () => getTotalDexData(chainId), swrConfig);
  return data;
}

export function useDexData() {
  const { chainId } = useActiveWeb3React();
  const client = useApollo(undefined, chainId);
  const { data } = useSWR(["dexData", client, chainId], async () => getDexData(chainId), swrConfig);
  return data;
}

export function useTokenSummary() {
  const { chainId } = useActiveWeb3React();
  const [state, setState] = useState();

  useEffect(() => {
    async function f() {
      const data = await getTokenSummary(chainId);
      if (data?.data?.uniswapDayDatas) {
        setState(data.data.uniswapDayDatas);
      }
    }
    function fetch() {
      retry(f, { n: 10, minWait: 250, maxWait: 1000 });
    }
    fetch();
    const interval = setInterval(() => fetch(), 10000);
    return () => {
      window.clearInterval(interval);
    };
  }, [chainId]);

  return state;
}
