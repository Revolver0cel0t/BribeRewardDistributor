import { SWRConfiguration } from "swr";

export const fastSWRConfig: SWRConfiguration = {
  refreshInterval: 5000,
  revalidateOnFocus: false,
  focusThrottleInterval: 5000,
};

export const midSWRConfig: SWRConfiguration = {
  refreshInterval: 15000,
  revalidateOnFocus: false,
  focusThrottleInterval: 15000,
};

export const largeSWRConfig: SWRConfiguration = {
  refreshInterval: 45000,
  revalidateOnFocus: false,
  focusThrottleInterval: 45000,
};

export const noRefreshSWRConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnMount: false,
  revalidateOnReconnect: false,
  refreshWhenOffline: false,
  refreshWhenHidden: false,
  refreshInterval: 0,
  dedupingInterval: 600000,
};

export const assetSWRConfig: SWRConfiguration = {
  refreshInterval: 600000,
  revalidateOnFocus: false,
  focusThrottleInterval: 600000,
};

export const migrateSWRConfig: SWRConfiguration = {
  refreshInterval: 600000,
  revalidateOnFocus: false,
  focusThrottleInterval: 600000,
  shouldRetryOnError: true,
  errorRetryCount: 1,
  errorRetryInterval: 1000,
};

export const creditSWRConfig = { refreshInterval: 1000 };
