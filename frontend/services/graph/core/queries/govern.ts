import gql from "graphql-tag";

export const locksQuery = gql`
  query locks($owner: String) {
    locks(where: { owner: $owner }) {
      id
      owner
      tokenId
      createdAt
    }
  }
`;
