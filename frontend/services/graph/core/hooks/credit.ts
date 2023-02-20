import useSWR from "swr";

import useActiveWeb3React from "hooks/useActiveWeb3React";
import { assetSWRConfig } from "stores/constants/swr";
import { getMaturitiesForLendingPair } from "../fetchers";

export function useMaturitiesForLendingPair(asset, collateral) {
  const { chainId } = useActiveWeb3React();
  return useSWR(
    asset && collateral && chainId ? ["maturitiesForLendingPair", asset, collateral, chainId] : null,
    () => getMaturitiesForLendingPair(asset, collateral, { chainId }),
    assetSWRConfig,
  );
}
