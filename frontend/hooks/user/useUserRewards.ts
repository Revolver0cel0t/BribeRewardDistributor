import useActiveWeb3React from "../useActiveWeb3React";
import useSWR from "swr";
import { assetSWRConfig } from "stores/configuration/swr";
import { CURRENT_EPOCH_CODE, merkleClaimAddress } from "stores/constants";
import { getTokenInfo } from "functions/getTokenSymbol";
import MERKLE_CLAIM_ABI from "stores/abis/merkleClaim.json";

export const useUserRewards = () => {
  const { account, provider: web3, chainId } = useActiveWeb3React();

  const { data, isLoading, mutate } = useSWR(
    account && web3 ? ["rewardData", account, chainId] : null,
    async () => {
      const data = await fetch(
        `/api/userRewards?epoch=${CURRENT_EPOCH_CODE}&address=${account}`
      );
      if (data.status === 200) {
        const rewards = (await data.json()).rewardInfo;
        const tokens = rewards.rewardInfo.tokens;
        try {
          const merkleClaimerContract = new web3.eth.Contract(
            MERKLE_CLAIM_ABI as AbiItem[],
            merkleClaimAddress[chainId]
          );

          const hasClaimed = await merkleClaimerContract.methods
            .hasClaimed(account)
            .call();
          if (Boolean(hasClaimed)) return;
        } catch (e) {
          console.log("hi");
          console.log(e);
        }

        const amounts = rewards.rewardInfo.amounts;
        const tokenInfoCalls = tokens.map(
          async (token: string) => await getTokenInfo(web3, token)
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
