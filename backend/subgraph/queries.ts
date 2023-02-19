import gql from "graphql-tag";

export const allLocksQuery = gql`
  query ($skip: Int!) {
    locks(
      first: 1000
      orderBy: tokenId
      orderDirection: desc
      where: { owner_not: "0x0000000000000000000000000000000000000000" }
      skip: $skip
    ) {
      tokenId
    }
  }
`;

export const allPairDataQuerySwap = gql`
  query PairsQuery {
    pairs: swapPairs(
      first: 1000
      orderBy: volumeUSD
      orderDirection: desc
      where: { gaugeAddress_not: null } # where: { reserve0_gt: 0.01, reserve1_gt: 0.01, reserveUSD_gt: 0, bribe_not: null, gaugeAddress_not: null }
    ) {
      address: id
      reserve0
      reserve1
      reserveUSD
      totalSupply
      bribe {
        bribeAddress
        address: id
        rewardTokens {
          address: id
          totalSupply
          decimals
          symbol
          name
        }
      }
      token0 {
        address: id
        symbol
        totalSupply
        name
        decimals
        derivedETH
      }
      token1 {
        address: id
        name
        decimals
        symbol
        totalSupply
        derivedETH
      }
      gaugeAddress
      stable
    }
  }
`;
