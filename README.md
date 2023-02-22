# Bribe Reward Distributor

A set of backend scripts, contracts and accompanying frontend for claiming bribes.

## Environment Variables

To run this project, you will need to add the following environment variables to your .env.local file (Located at the root of your repo)

`ALCHEMY_API_KEY`

`PRIVATE_KEY`

`ARBSCAN_API_KEY`

`NEXT_PUBLIC_SERVICE_TYPE`

`NEXT_PUBLIC_SERVICE_PROJECT_ID`

`NEXT_PUBLIC_SERVICE_PRIVATE_KEY_ID`

`NEXT_PUBLIC_SERVICE_PRIVATE_KEY`

`NEXT_PUBLIC_SERVICE_CLIENT_EMAIL`

`NEXT_PUBLIC_SERVICE_CLIENT_ID`

`NEXT_PUBLIC_SERVICE_AUTH_URI`

`NEXT_PUBLIC_SERVICE_TOKEN_URI`

`NEXT_PUBLIC_SERVICE_AUTH_CERT_URL`

`NEXT_PUBLIC_SERVICE_CLIENT_CERT_URL`

`NEXT_PUBLIC_ALCHEMY_API_KEY`

## Backend Testing (Arbitrum Goerli)

Before you start, make sure you update the bribe amounts for each bribe in getBribeRewardsAllUsers/input/bribes.json (merkle distribution will be based on the amts here)

1. First install all the dependencies for the backend folder by running

```bash
  yarn install
```

2. Run the following command to get epoch end block for previous epoch

```bash
  npx hardhat get-block-number-for-epoch-start
```

3. Fork arbitrum locally using the blocknumber from the previous step.

```bash
  npx hardhat node --fork-url <arbitrum-one-fork-url> --fork-block-number <blocknumber>
```

4. Run the following command to calculate the bribe rewards for every user. (Output will be stored in getBribeRewardsAllUsers/output/rewards.json)

```bash
  npx hardhat calculate-bribe-rewards --network local
```

5. Generate the merkle tree for rewards data by running (output will be stored in generateMerkleTree/output/proofs.json)

```bash
  npx hardhat generate-merkle-tree
```

6. Deploy the merkle claim contract(make sure to update the trees root hash in scripts/deploy.ts)

```bash
  npx hardhat deploy-merkle-claim --network arbGoerliRollup
```

## Frontend Testing

1. Update the merkle Claim address from the contract generated in the previous section under stores/constants/index.ts

2. Install dependancies

```bash
  yarn install
```

3. Run (make sure you have an address that has bribe rewards to test this out)

```bash
  yarn run dev
```
