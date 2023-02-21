import useActiveWeb3React from "../useActiveWeb3React";
import useSWR from "swr";
import { assetSWRConfig } from "stores/configuration/swr";
import { CURRENT_EPOCH_CODE } from "stores/constants";
import { getTokenInfo } from "functions/getTokenSymbol";

export const useUserRewards = () => {
  const { account, provider: web3 } = useActiveWeb3React();

  const { data, isLoading, mutate } = useSWR(
    account && web3 ? ["rewardData", account] : null,
    async () => {
      const data = await fetch(
        `/api/userRewards?epoch=${CURRENT_EPOCH_CODE}&address=${account}`
      );
      if (data.status === 200) {
        const rewards = (await data.json()).rewardInfo;
        const tokens = Object.keys(rewards.rewardInfo);
        const amounts = tokens.map((token) => rewards.rewardInfo[token]);
        const tokenInfoCalls = tokens.map(
          async (token) => await getTokenInfo(web3, token)
        );
        let symbols: string[] = [];
        let decimals: number[] = [];
        for await (const tokenInfo of tokenInfoCalls) {
          symbols.push(tokenInfo.symbol);
          decimals.push(tokenInfo.decimals);
        }

        return {
          proof: rewards.proof,
          tokens,
          amounts,
          symbols,
          decimals,
        };
      }
      throw new Error("Reward data does not exist");
    },
    assetSWRConfig
  );

  return { data, isLoading, mutate };
};
