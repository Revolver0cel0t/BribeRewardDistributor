import { useMemo } from "react";
import { useWeb3React, getWeb3ReactContext } from "@web3-react/core";
import Web3 from "web3";
import { Eth } from "web3-eth";
import { provider } from "web3-core";
import { createAlchemyWeb3, AlchemyWeb3 } from "@alch/alchemy-web3";
import { ChainIds, network } from "stores/connectors/connectors";
import { Alchemy, Network } from "alchemy-sdk";
import { Web3ReactContextInterface } from "@web3-react/core/dist/types";
import { RPC_URLS } from "stores/connectors/connectors";
import { supportedChainIds } from "stores/connectors/connectors";

const chainToNetworkMapping = {
  [ChainIds.ETHEREUM]: "eth-mainnet",
};

interface CustomWeb3 extends Web3ReactContextInterface {
  provider: Web3;
  oldLibrary: Web3ReactContextInterface["library"];
  account: string;
  library: Eth;
  wrongChain: boolean;
}

export type CustomWeb3ReactContextInterface = Omit<CustomWeb3, "connector"> & {
  connector: provider;
  account: string | true | null | undefined;
  alchemyWeb3Provider: Alchemy;
};

//@ts-ignore
export const getWeb3Provider = (context): AlchemyWeb3 => {
  let provider = null;

  if (!context) {
    provider = network.getProvider();
  } else {
    provider = context?.library?.provider;
  }
  return createAlchemyWeb3(
    //@ts-ignore
    RPC_URLS[
      !supportedChainIds.includes(context.chainId)
        ? ChainIds.ARBITRUM
        : context?.chainId
    ]
  );
};

export const getAlchemyProvider = (context: any) => {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    network:
      //@ts-ignore
      chainToNetworkMapping[
        !supportedChainIds.includes(context.chainId)
          ? ChainIds.ETHEREUM
          : context?.chainId
      ],
  };
  return new Alchemy(config);
};

const getWeb3Object = (
  context: Web3ReactContextInterface,
  contextNetwork: Web3ReactContextInterface
): CustomWeb3ReactContextInterface => {
  // const impersonate = false;
  const impersonate = "0xEA59dd3cD190ed20D0c63C6Bf66B1EaF7ad45976";
  const Obj = context.active
    ? { ...context, account: impersonate || context.account }
    : { ...contextNetwork, account: impersonate || contextNetwork.account };

  const web3Provider = getWeb3Provider(Obj);
  const alchemyWeb3Provider = getAlchemyProvider(Obj);
  //@ts-ignore
  return {
    ...Obj,
    provider: web3Provider,
    library: web3Provider?.eth,
    connector: web3Provider?.currentProvider,
    oldLibrary: Obj?.library,
    //@ts-ignore
    wrongChain: !supportedChainIds.includes(Obj.chainId),
    chainId: Obj.chainId,
    alchemyWeb3Provider,
  };
};

const useActiveWeb3React = (): CustomWeb3ReactContextInterface => {
  const context = useWeb3React();
  const contextNetwork = useWeb3React("NETWORK");
  return useMemo(
    () => getWeb3Object(context, contextNetwork),
    [context, contextNetwork]
  );
};

export const getActiveWeb3React = (): CustomWeb3ReactContextInterface => {
  const context = (getWeb3ReactContext() as any)._currentValue;
  const contextNetwork = (getWeb3ReactContext("NETWORK") as any)._currentValue;
  return getWeb3Object(context, contextNetwork);
};

//@ts-ignore
export const getWeb3ProviderForCall = async (context) => {
  const web3context = context;
  let provider = null;

  if (!web3context) {
    provider = network.getProvider();
  } else {
    provider = web3context.provider;
  }

  if (!provider) {
    return null;
  }
  return new Web3(provider);
};

export default useActiveWeb3React;
