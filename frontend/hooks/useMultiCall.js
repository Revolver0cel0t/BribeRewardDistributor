import Multicall from "functions/multicall/Multicall";
import { useMemo } from "react";
import { CONTRACTS } from "stores/constants/constants";
import useActiveWeb3React from "./useActiveWeb3React";

export const useMultiCall = () => {
  const { provider, chainId } = useActiveWeb3React();

  return useMemo(() => {
    try {
      return new Multicall({
        multicallAddress: CONTRACTS.MULTICALL_ADDRESS[chainId],
        provider: provider,
      });
    } catch (error) {
      return undefined;
    }
  }, [provider, chainId]);
};
