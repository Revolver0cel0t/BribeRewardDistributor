import gql from "graphql-tag";

export const allLocksQuery = gql`
  query ($skip: Int!, $blockNumber: Int!) {
    locks(
      block: { number: $blockNumber }
      first: 1000
      orderBy: tokenId
      orderDirection: desc
      skip: $skip
      where: { owner_not: "0x0000000000000000000000000000000000000000" }
    ) {
      tokenId
      owner
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

export const allPairDataQuerySwapWithGauge = gql`
  query PairsQuery {
    pairs: swapPairs(first: 1000, orderBy: volumeUSD, orderDirection: desc) {
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

export const allUsersQuery = gql`
  query ($skip: Int!) {
    users(first: 1000, skip: $skip) {
      id
    }
  }
`;

export const liqSnapshotsQuery = gql`
  query ($skip: Int!, $blockNumber: Int!, $endblock: Int!, $pair: String!) {
    liquidityPositionSnapshots(
      first: 1000
      skip: $skip
      where: { pair: $pair, block_gte: $blockNumber, block_lte: $endblock }
      orderBy: block
      orderDirection: asc
    ) {
      id
      liquidityTokenBalance
      gaugeBalance
      user {
        id
      }
    }
  }
`;

export const tokenDayDatasQuery = gql`
  query ($blockTimestamp: Int!, $token: String!) {
    tokenDayDatas(first: 1, where: { date: $blockTimestamp, token: $token }) {
      priceUSD
    }
  }
`;
