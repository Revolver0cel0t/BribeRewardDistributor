import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { NetworkConnector } from "@web3-react/network-connector";

export enum ChainIds {
  ETHEREUM = 1,
  ARBITRUM = 42161,
  FANTOM = 250,
  ARBITRUM_RINKEBY = 421611,
  ARBITRUM_GOERLI = 421613,
  KOVAN = 42,
  GOERLI = 5,
}

export const ETHERSCAN_URL = {
  [ChainIds.ARBITRUM]: "https://arbiscan.io/",
  [ChainIds.ARBITRUM_GOERLI]: "https://goerli-rollup-explorer.arbitrum.io/",
  [ChainIds.GOERLI]: "https://goerli.etherscan.io/",
};

export const supportedChainIds = [ChainIds.ARBITRUM, ChainIds.ARBITRUM_GOERLI];

const POLLING_INTERVAL = 12000;
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
export const RPC_URLS = {
  [ChainIds.ARBITRUM]: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  [ChainIds.GOERLI]: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
  [ChainIds.ARBITRUM_GOERLI]: `https://arb-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  [ChainIds.ETHEREUM]: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
};

export const names = (chainId: number): string => {
  switch (chainId) {
    case 250: {
      return "Fantom";
    }
    case 43114: {
      return "Avalanche";
    }
    case 137: {
      return "Polygon";
    }
    case 42161: {
      return "Arbitrum";
    }
    case ChainIds.GOERLI: {
      return "Goerli";
    }
    case ChainIds.ARBITRUM_GOERLI: {
      return "Arbitrum Goerli";
    }
    default: {
      return "Wrong Chain";
    }
  }
};

export const chainLogoURI = (chainId: number): string => {
  switch (chainId) {
    case ChainIds.ARBITRUM_GOERLI:
      return "/images/Arbitrum-logo.png";
    case ChainIds.ARBITRUM:
      return "/images/Arbitrum-logo.png";
    case ChainIds.GOERLI:
    default:
      return "/images/fantom-ftm-logo.svg";
  }
};

export const network = new NetworkConnector({
  urls: {
    [ChainIds.ARBITRUM]: RPC_URLS[ChainIds.ARBITRUM],
    [ChainIds.ARBITRUM_GOERLI]: RPC_URLS[ChainIds.ARBITRUM_GOERLI],
    [ChainIds.GOERLI]: RPC_URLS[ChainIds.GOERLI],
    [ChainIds.ETHEREUM]: RPC_URLS[ChainIds.ETHEREUM],
  },
  defaultChainId: ChainIds.ARBITRUM,
});

export const injected = new InjectedConnector({
  // supportedChainIds: [ChainIds.ARBITRUM],
});

export const walletconnect = new WalletConnectConnector({
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  // @ts-ignore
  pollingInterval: POLLING_INTERVAL,
  // supportedChainIds: [ChainIds.ARBITRUM],
});

export const connectorsByName: { [value: string]: any } = {
  MetaMask: injected,
  WalletConnect: walletconnect,
};

export const ADD_CHAIN = {
  [ChainIds.ARBITRUM]: {
    chainId: "0xA4B1",
    chainName: "Arbitrum",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [RPC_URLS[ChainIds.ARBITRUM]],
    blockExplorerUrls: [ETHERSCAN_URL[ChainIds.ARBITRUM]],
  },
  [ChainIds.ARBITRUM_GOERLI]: {
    chainId: "0x66EED",
    chainName: "Arbitrum Nitro Goerli Testnet",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://goerli-rollup.arbitrum.io/rpc"],
    blockExplorerUrls: [ETHERSCAN_URL[ChainIds.ARBITRUM_GOERLI]],
  },
  [ChainIds.GOERLI]: {
    chainId: "0x5",
    chainName: "Goerli",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [RPC_URLS[ChainIds.GOERLI]],
    blockExplorerUrls: [ETHERSCAN_URL[ChainIds.GOERLI]],
  },
};
