import { useEffect } from "react";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import stores from "stores";
import { supportedChainIds } from "stores/connectors/connectors";

export const Web3StoreUpdater = () => {
  const context = useActiveWeb3React();

  useEffect(() => {
    stores.accountStore.setStore({
      ...stores.accountStore.store,
      web3context: context,
      account: {
        address: context?.account,
      },
      chainId: supportedChainIds.includes(context?.chainId)
        ? context?.chainId
        : undefined,
      chainInvalid: !supportedChainIds.includes(context?.chainId),
    });
  }, [context]);

  return null;
};
