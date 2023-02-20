import gql from "graphql-tag";
import { ChainId } from "stores/constants";
import { FACTORY_ADDRESS } from "../../config/index.ts";

export const factoryQuery = gql`
  query factoryQuery(
    $id: String! = "${FACTORY_ADDRESS}"
  ) {
    factory(id: $id) {
      id
      volumeUSD
      oneDay @client
      twoDay @client
    }
  }
`;

export const factoryTimeTravelQuery = gql`
  query factoryTimeTravelQuery(
    $id: String! = "${FACTORY_ADDRESS}"
    $block: Block_height!
  ) {
    factory(id: $id, block: $block) {
      id
      volumeUSD
    }
  }
`;

export const userIdsQuery = gql`
  query userIdsQuery($first: Int! = 1000, $skip: Int! = 0) {
    users(first: $first, skip: $skip) {
      id
    }
  }
`;

export const userQuery = gql`
  query userQuery($id: String!) {
    user: user(id: $id) {
      id
    }
  }
`;

export const oneDayAvaxPriceQuery = gql`
  query OneDayAvaxPrice {
    avaxPrice @client
  }
`;

export const sevenDayAvaxPriceQuery = gql`
  query sevenDayAvaxPrice {
    avaxPrice @client
  }
`;

export const bundleFields = gql`
  fragment bundleFields on Bundle {
    id
    ethPrice
  }
`;

export const ethPriceQuery = gql`
  query ethPriceQuery($id: Int! = 1) {
    bundle(id: $id) {
      ...bundleFields
    }
  }
  ${bundleFields}
`;

export const tokenPriceETHQuery = gql`
  query tokenPriceETHQuery($id: String) {
    token(id: $id) {
      derivedETH
    }
    bundle(id: 1) {
      id
      ethPrice
    }
  }
`;

export const avaxPriceTimeTravelQuery = gql`
  query avaxPriceTimeTravelQuery($id: Int! = 1, $block: Block_height!) {
    bundles(id: $id, block: $block) {
      ...bundleFields
    }
  }
  ${bundleFields}
`;

export const dayDataFieldsQuery = gql`
  fragment dayDataFields on DayData {
    id
    date
    volumeAVAX
    volumeUSD
    untrackedVolume
    liquidityAVAX
    liquidityUSD
    txCount
  }
`;

// Dashboard...
export const dayDatasQuery = gql`
  query dayDatasQuery($first: Int! = 1000, $date: Int! = 0) {
    dayDatas(first: $first, orderBy: date, orderDirection: desc) {
      ...dayDataFields
    }
  }
  ${dayDataFieldsQuery}
`;

// Pairs...

export const pairTokenFieldsQuery = gql`
  fragment pairTokenFields on Token {
    id
    name
    symbol
    totalSupply
    derivedAVAX
  }
`;

export const pairFieldsQuery = gql`
  fragment pairFields on Pair {
    id
    reserveUSD
    reserveAVAX
    volumeUSD
    untrackedVolumeUSD
    trackedReserveAVAX
    token0 {
      ...pairTokenFields
    }
    token1 {
      ...pairTokenFields
    }
    reserve0
    reserve1
    token0Price
    token1Price
    totalSupply
    txCount
    timestamp
  }
  ${pairTokenFieldsQuery}
`;

export const uniswapDayDatas = gql`
  query MyQuery {
    uniswapDayDatas(first: 1000, orderBy: date, orderDirection: desc) {
      ...UniswapDayDataFragment
    }
  }

  fragment UniswapDayDataFragment on UniswapDayData {
    id
    txCount
    date
    dailyVolumeUSD
    dailyVolumeETH
    totalLiquidityUSD
  }
`;

export const uniswapFactoryQuery = gql`
  query MyQuery {
    swapFactories {
      totalLiquidityETH
      totalLiquidityUSD
      totalVolumeETH
      totalVolumeUSD
      untrackedVolumeUSD
    }
  }
`;

export const pairQuery = gql`
  query pairQuery($id: String!) {
    pair(id: $id) {
      ...pairFields
      oneDay @client
      twoDay @client
    }
  }
  ${pairFieldsQuery}
`;

export const pairTimeTravelQuery = gql`
  query pairTimeTravelQuery($id: String!, $block: Block_height!) {
    pair(id: $id, block: $block) {
      ...pairFields
    }
  }
  ${pairFieldsQuery}
`;

export const pairIdsQuery = gql`
  query pairIdsQuery($first: Int! = 1000) {
    pairs(first: $first, orderBy: volumeUSD, orderDirection: desc) {
      id
    }
  }
`;

export const pairCountQuery = gql`
  query pairCountQuery {
    swapFactories {
      pairCount
    }
  }
`;

export const pairDayDatasQuery = gql`
  query pairDayDatasQuery($first: Int = 1000, $date: Int = 0, $pairs: [Bytes]!) {
    pairDayDatas(first: $first, orderBy: date, orderDirection: desc, where: { pairAddress_in: $pairs }) {
      date
      pairAddress
      token0 {
        derivedETH
      }
      token1 {
        derivedETH
      }
      dailyVolumeUSD
      data: reserveUSD
      dailyVolumeToken0
      dailyVolumeToken1
      totalSupply
      dailyTxns
    }
  }
`;

export const liquidityPositionSubsetQuery = gql`
  query liquidityPositionSubsetQuery($first: Int! = 1000, $user: Bytes!) {
    liquidityPositions(first: $first, where: { user: $user }) {
      id
      liquidityTokenBalance
      user {
        id
      }
      pair {
        id
      }
    }
  }
`;

export const pairSubsetQuery = gql`
  query pairSubsetQuery(
    $first: Int! = 1000
    $pairAddresses: [Bytes]!
    $orderBy: String! = "trackedReserveAVAX"
    $orderDirection: String! = "desc"
  ) {
    pairs(first: $first, orderBy: $orderBy, orderDirection: $orderDirection, where: { id_in: $pairAddresses }) {
      ...pairFields
      oneDay @client
      sevenDay @client
    }
  }
  ${pairFieldsQuery}
`;

export const pairsQuery = gql`
  query pairsQuery($first: Int! = 1000, $orderBy: String! = "trackedReserveAVAX", $orderDirection: String! = "desc") {
    pairs(first: $first, orderBy: $orderBy, orderDirection: $orderDirection) {
      ...pairFields
      oneDay @client
      sevenDay @client
    }
  }
  ${pairFieldsQuery}
`;

export const pairsTimeTravelQuery = gql`
  query pairsTimeTravelQuery($first: Int! = 1000, $pairAddresses: [Bytes]!, $block: Block_height!) {
    pairs(
      first: $first
      block: $block
      orderBy: trackedReserveAVAX
      orderDirection: desc
      where: { id_in: $pairAddresses }
    ) {
      id
      reserveUSD
      trackedReserveAVAX
      volumeUSD
      untrackedVolumeUSD
      txCount
    }
  }
`;

// Tokens...
export const tokenFieldsQuery = gql`
  fragment tokenFields on Token {
    id
    symbol
    name
    decimals
    totalSupply
    volume
    volumeUSD
    untrackedVolumeUSD
    txCount
    liquidity
    derivedAVAX
  }
`;

export const tokenQuery = gql`
  query tokenQuery($id: String!) {
    token(id: $id) {
      ...tokenFields
      oneDay @client
      twoDay @client
    }
  }
  ${tokenFieldsQuery}
`;

export const tokenTimeTravelQuery = gql`
  query tokenTimeTravelQuery($id: String!, $block: Block_height!) {
    token(id: $id, block: $block) {
      ...tokenFields
    }
  }
  ${tokenFieldsQuery}
`;

export const tokenIdsQuery = gql`
  query tokenIdsQuery($first: Int! = 1000) {
    tokens(first: $first, orderBy: volumeUSD, orderDirection: desc) {
      id
    }
  }
`;

export const tokenDayDatasQuery = gql`
  query tokenDayDatasQuery($first: Int! = 1000, $tokens: [Bytes]!, $date: Int! = 0) {
    tokenDayDatas(first: $first, orderBy: date, orderDirection: desc, where: { token_in: $tokens, date_gt: 0 }) {
      id
      date
      token {
        id
      }
      volumeUSD
      liquidityUSD
      priceUSD
      txCount
    }
  }
`;

export const tokenPairsQuery = gql`
  query tokenPairsQuery($id: String!) {
    pairs0: pairs(first: 1000, orderBy: reserveUSD, orderDirection: desc, where: { token0: $id }) {
      ...pairFields
      oneDay @client
      sevenDay @client
    }
    pairs1: pairs(first: 1000, orderBy: reserveUSD, orderDirection: desc, where: { token1: $id }) {
      ...pairFields
      oneDay @client
      sevenDay @client
    }
  }
  ${pairFieldsQuery}
`;

export const tokensQuery = gql`
  query tokensQuery($first: Int! = 1000) {
    tokens(first: $first, orderBy: volumeUSD, orderDirection: desc) {
      ...tokenFields
      dayData(first: 7, skip: 0, orderBy: date, order: asc) {
        id
        priceUSD
      }
      # hourData(first: 168, skip: 0, orderBy: date, order: asc) {
      #   priceUSD
      # }
      oneDay @client
      sevenDay @client
    }
  }
  ${tokenFieldsQuery}
`;

// block @client @export(as: "block")
export const tokensTimeTravelQuery = gql`
  query tokensTimeTravelQuery($first: Int! = 1000, $block: Block_height!) {
    tokens(first: $first, block: $block, orderBy: volumeUSD, orderDirection: desc) {
      ...tokenFields
    }
  }
  ${tokenFieldsQuery}
`;

// Transactions...
export const transactionsQuery = gql`
  query transactionsQuery($pairAddresses: [Bytes]!) {
    swaps(orderBy: timestamp, orderDirection: desc, where: { pair_in: $pairAddresses }) {
      id
      timestamp
      pair {
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
      sender
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      to
    }
    mints(orderBy: timestamp, orderDirection: desc, where: { pair_in: $pairAddresses }) {
      id
      timestamp
      pair {
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
      sender
      amount0
      amount1
      amountUSD
      to
    }
    burns(orderBy: timestamp, orderDirection: desc, where: { pair_in: $pairAddresses }) {
      id
      timestamp
      pair {
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
      sender
      amount0
      amount1
      amountUSD
      to
    }
  }
`;

//swap page queries
export const swapInfoQuery = gql`
  query MyQuery($id: String!) {
    tokenOldPrice: token(id: $id) {
      tokenDayData(orderBy: date, orderDirection: asc, first: 1) {
        firstDayPrice: priceUSD
      }
    }
    currentDayData: token(id: $id) {
      tokenDayData(orderBy: date, orderDirection: desc, first: 2) {
        priceUSD
        dailyVolumeUSD
      }
    }
  }
`;

export const topTokensQuery = gql`
  query MyQuery {
    tokens(first: 5, orderBy: tradeVolumeUSD, orderDirection: desc) {
      id
      name
      symbol
    }
  }
`;

export const singleSwapChartInfoQuery = gql`
  query MyQuery($tokenA: String!, $tokenB: String!) {
    tokenAData: tokenDayDatas(
      first: 1000
      orderBy: date
      orderDirection: desc
      where: { token_contains_nocase: $tokenA }
    ) {
      priceUSD
      id
      date
    }
    tokenBData: tokenDayDatas(
      first: 1000
      orderBy: date
      orderDirection: desc
      where: { token_contains_nocase: $tokenB }
    ) {
      priceUSD
      id
      date
    }
  }
`;

export const multiswapChartInfoQuery = gql`
  query MyQuery($address0: String!, $address1: String!, $address2: String!, $address3: String!, $address4: String!) {
    token0: token(id: $address0) {
      tokenDayData(orderBy: date, orderDirection: asc, first: 1000) {
        value: priceUSD
        date
      }
    }
    token1: token(id: $address1) {
      tokenDayData(orderBy: date, orderDirection: asc, first: 1000) {
        value: priceUSD
        date
      }
    }
    token2: token(id: $address2) {
      tokenDayData(orderBy: date, orderDirection: asc, first: 1000) {
        value: priceUSD
        date
      }
    }
    token3: token(id: $address3) {
      tokenDayData(orderBy: date, orderDirection: asc, first: 1000) {
        value: priceUSD
        date
      }
    }
    token4: token(id: $address4) {
      tokenDayData(orderBy: date, orderDirection: asc, first: 1000) {
        value: priceUSD
        date
      }
    }
  }
`;

export const locksQuery = gql`
  query locksQuery {
    locks(orderBy: createdAt, orderDirection: desc, first: 1) {
      tokenId
    }
  }
`;

export const allPairDataQuerySwap = {
  [ChainId.FANTOM]: gql`
    query PairsQuery {
      pairs(first: 1000, orderBy: volumeUSD, orderDirection: desc, where: { reserve0_gt: 0 }) {
        address: id
        reserve0
        reserve1
        totalSupply
        token0 {
          decimals
          address: id
          name
          symbol
        }
        token1 {
          decimals
          address: id
          name
          symbol
        }
      }
    }
  `,
  [ChainId.ARBITRUM_GOERLI]: gql`
    query PairsQuery {
      pairs: swapPairs(first: 1000, orderBy: volumeUSD, orderDirection: desc) {
        address: id
        reserve0
        reserve1
        reserveUSD
        totalSupply
        bribe {
          bribeAddress
          id
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
        }
        token1 {
          address: id
          name
          decimals
          symbol
          totalSupply
        }
        gaugeAddress
        stable
        pairDayData(first: 1, orderBy: date, orderDirection: desc) {
          dailyVolumeToken0
          dailyVolumeToken1
          dailyVolumeUSD
        }
      }
    }
  `,
  [ChainId.GÖRLI]: gql`
    query PairsQuery {
      pairs: swapPairs(first: 1000, orderBy: volumeUSD, orderDirection: desc) {
        address: id
        reserve0
        reserve1
        totalSupply
        bribe {
          bribeAddress
          id
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
        }
        token1 {
          address: id
          name
          decimals
          symbol
          totalSupply
        }
        gaugeAddress
        stable
        pairDayData(first: 1, orderBy: date, orderDirection: desc) {
          dailyVolumeToken0
          dailyVolumeToken1
          dailyVolumeUSD
        }
      }
    }
  `,
  [ChainId.ARBITRUM]: gql`
    query PairsQuery {
      pairs: swapPairs(first: 1000, orderBy: volumeUSD, orderDirection: desc) {
        address: id
        reserve0
        reserve1
        reserveUSD
        totalSupply
        bribe {
          bribeAddress
          id
          rewardTokens {
            address: id
            totalSupply
            decimals
            symbol
            name
            derivedETH
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
        pairDayData(first: 4, orderBy: date, orderDirection: desc) {
          dailyVolumeToken0
          dailyVolumeToken1
          dailyVolumeUSD
        }
      }
    }
  `,
};

export const subgraphTokenPricing = gql`
  query PricingQuery($addresses: [String!]) {
    tokens(where: { id_in: $addresses }) {
      id
      derivedETH
    }
  }
`;

export const reserveDataSwap = gql`
  query PairsQuery($address: String!) {
    pair: swapPair(id: $address) {
      reserveUSD
      pairDayData(first: 4, orderBy: date, orderDirection: desc) {
        dailyVolumeToken0
        dailyVolumeToken1
        dailyVolumeUSD
      }
    }
  }
`;

export const pairDayDataSwap = gql`
  query PairsQuery($address: String!) {
    pairDayData: pairDayDatas(
      first: 1
      where: { pair_contains_nocase: $address }
      orderBy: date
      orderDirection: desc
    ) {
      dailyVolumeToken0
      dailyVolumeToken1
      dailyVolumeUSD
    }
  }
`;

export const creditPairData = gql`
  query CreditPairQuery($maturity: String!) {
    pairs: lendingPairPools(first: 1000, orderBy: maturity, orderDirection: asc, where: { maturity_gt: $maturity }) {
      address: id
      bondInterestAddress
      bondPrincipalAddress
      collateralizedDebtAddress
      insuranceInterestAddress
      liquidityAddress
      insurancePrincipalAddress
      maturity
      bribe {
        bribeAddress
        id
        rewardTokens {
          address: id
          totalSupply
          decimals
          symbol
          name
        }
      }
      gaugeAddress
      pair {
        name
        token0: asset {
          decimals
          address: id
          name
          symbol
        }
        address: id
        token1: collateral {
          address: id
          name
          decimals
          symbol
        }
      }
    }
  }
`;
