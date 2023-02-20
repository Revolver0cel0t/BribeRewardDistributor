import gql from "graphql-tag";

const lendingPairGraph = `
  address: id
  name
  fee
  protocolFee
  asset {
    address: id
    symbol
    name
    decimals
  }
  collateral {
    address: id
    symbol
    name
    decimals
  }
  pools {
    id
    maturity
    X
    Y
    Z
    assetReserve
    collateralReserve
    liquidityAddress
    bondInterestAddress
    bondPrincipalAddress
    insuranceInterestAddress
    insurancePrincipalAddress
    collateralizedDebtAddress
    timestamp
  }
  `;

export const activeLendingPairsQuery = gql`
  query marketsQuery($minMaturity: Int!) {
    lendingPairs {
      address: id
      name
      fee
      protocolFee
      asset {
        address: id
        symbol
        name
        decimals
      }
      collateral {
        address: id
        symbol
        name
        decimals
      }
      pools(where: { maturity_gt: $minMaturity }) {
        id
        maturity
        X
        Y
        Z
        assetReserve
        collateralReserve
        liquidityAddress
        bondInterestAddress
        bondPrincipalAddress
        insuranceInterestAddress
        insurancePrincipalAddress
        collateralizedDebtAddress
        timestamp
      }
    }
  }
`;

export const lendingPairQuery = gql`
  query lendingPairQuery($id: ID!) {
    lendingPair(id: $id) {
      address: id
      name
      asset {
        address: id
        symbol
        totalSupply
        name
        decimals
      }
      collateral {
        address: id
        symbol
        totalSupply
        name
        decimals
      }
    }
  }
`;

export const lendingPairWithPoolsQuery = gql`
  query lendingPairQuery($id: ID!) {
    lendingPair(id: $id) {
      ${lendingPairGraph}
    }
  }
`;

export const lendingPairUsingTokens = gql`
  query MyQuery($asset: ID!, $collateral: ID!) {
    lendingPairs(where: { asset_: { id: $asset }, collateral_: { id: $collateral } }) {
      id
      pools {
        maturity
      }
    }
  }
`;
export const borrowCDTsQuery = gql`
  query borrowedLendingPool($user: ID!) {
    collateralizedDebtTokens(where: { user: $user }) {
      tokenId
      pool {
        id
        maturity
        X
        Y
        Z
        assetReserve
        collateralReserve
        liquidityAddress
        bondInterestAddress
        bondPrincipalAddress
        insuranceInterestAddress
        insurancePrincipalAddress
        collateralizedDebtAddress
        pair {
          address: id
          name
          fee
          protocolFee
          asset {
            address: id
            symbol
            name
            decimals
          }
          collateral {
            address: id
            symbol
            name
            decimals
          }
        }
        timestamp
      }
    }
  }
`;
