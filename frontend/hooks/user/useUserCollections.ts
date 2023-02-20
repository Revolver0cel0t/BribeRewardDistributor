import { GetContractsForOwnerResponse } from "alchemy-sdk";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { useMemo } from "react";
import { assetSWRConfig } from "stores/configuration/swr";
import useSWRInfinite, { SWRInfiniteResponse } from "swr/infinite";

export type Collection = {
  name?: string;
  symbol?: string;
  address: string;
  imgURI?: string;
};
export const useUserCollections = () => {
  const { alchemyWeb3Provider, account } = useActiveWeb3React();

  const getKey = (
    pageIndex: number,
    prevData: GetContractsForOwnerResponse
  ) => {
    if (pageIndex > 0 && !prevData.pageKey) return;
    return `/userNFTs?account=${account}&pageKey=${prevData?.pageKey}`;
  };

  const nftSWR: SWRInfiniteResponse<GetContractsForOwnerResponse, any> =
    useSWRInfinite(
      getKey,
      async (key) => {
        const params = new Proxy(new URLSearchParams(key), {
          get: (searchParams, prop: string) => searchParams.get(prop),
        });
        //@ts-ignore
        const { pageKey } = params;
        const data = await alchemyWeb3Provider.nft.getContractsForOwner(
          account,
          pageKey !== "undefined"
            ? {
                //@ts-ignore
                pageKey: pageKey,
              }
            : {}
        );
        return data;
      },
      {
        ...assetSWRConfig,
        initialSize: 1,
      }
    );

  const formattedData: Collection[] = useMemo(() => {
    if (nftSWR.data) {
      return nftSWR.data.flatMap((data) =>
        data.contracts.map((nft) => {
          return {
            address: nft.address,
            imgURI: nft?.media?.thumbnail,
            symbol: nft.symbol,
            name: nft.name,
          };
        })
      );
    }
    return [];
  }, [nftSWR.data]);

  return {
    contracts: formattedData,
    getNextPage: () => nftSWR.setSize(nftSWR.size + 1),
    isAllDataLoaded: nftSWR
      ? !nftSWR.data?.[nftSWR.data?.length - 1]?.pageKey
      : true,
    isLoading: nftSWR.isLoading,
  };
};
