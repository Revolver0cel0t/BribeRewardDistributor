import { OwnedNftsResponse } from "alchemy-sdk";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { useMemo } from "react";
import { assetSWRConfig } from "stores/configuration/swr";
import useSWRInfinite, { SWRInfiniteResponse } from "swr/infinite";

export type NFTItem = {
  collectionAddress: string;
  id: string;
  imgURI?: string;
  symbol?: string;
  name: string;
};

export const useUserInventory = () => {
  const { alchemyWeb3Provider, account } = useActiveWeb3React();

  const getKey = (pageIndex: number, prevData: OwnedNftsResponse) => {
    if (pageIndex > 0 && !prevData.pageKey) return;
    return `/userNFTs?account=${account}&pageKey=${prevData?.pageKey}`;
  };

  const nftSWR: SWRInfiniteResponse<OwnedNftsResponse, any> = useSWRInfinite(
    getKey,
    async (key) => {
      const params = new Proxy(new URLSearchParams(key), {
        get: (searchParams, prop: string) => searchParams.get(prop),
      });
      const data = await alchemyWeb3Provider.nft.getNftsForOwner(account, {
        //@ts-ignore
        pageKey: params?.pageKey,
        pageSize: 100,
      });
      return data;
    },
    {
      ...assetSWRConfig,
      initialSize: 1,
    }
  );

  const formattedData: NFTItem[] = useMemo(() => {
    if (nftSWR.data) {
      return nftSWR.data.flatMap((data) =>
        data.ownedNfts.map((nft) => {
          return {
            collectionAddress: nft.contract.address,
            id: nft.tokenId,
            imgURI: nft?.media?.[0]?.thumbnail,
            symbol: nft.contract.symbol,
            name: Boolean(nft.title)
              ? nft.title
              : `${nft.contract.symbol} #${nft.tokenId}`,
          };
        })
      );
    }
    return [];
  }, [nftSWR.data]);

  return {
    assets: formattedData,
    getNextPage: () => nftSWR.setSize(nftSWR.size + 1),
    isAllDataLoaded: nftSWR
      ? !nftSWR.data?.[nftSWR.data?.length - 1]?.pageKey
      : true,
    isLoading: nftSWR.isLoading,
  };
};
