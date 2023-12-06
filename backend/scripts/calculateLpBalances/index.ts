import { BigNumber, ethers } from "ethers";
import fs from "fs";
import { task } from "hardhat/config";
import path from "path";
import GAUGE_ABI from "../../constants/abis/gaugeABI.json";
import PAIR_ABI from "../../constants/abis/pairABI.json";
import { multicallSplitOnOverflow } from "../../lib/multicall";
import { allPairDataSwapWithGauge, getUsers } from "../../subgraph/fetchers";
import { Pair } from "../calculateAirdrop";

async function getBalanceDataInFormat(
  users: string[],
  pair: Pair,
  blocknumber: string,
  provider: ethers.providers.JsonRpcProvider
): Promise<{ address: string; balance: string }[]> {
  const balances = await getBalanceData(users, pair, blocknumber, provider);

  balances.sort((a, b) => {
    const balanceA = BigNumber.from(a);
    const balanceB = BigNumber.from(b);
    return balanceB.sub(balanceA).isNegative()
      ? -1
      : balanceA.sub(balanceB).isNegative()
      ? 1
      : 0;
  });

  return balances
    ?.filter((balance) => balance?.gt(0))
    .map((balance, index) => ({
      address: users[index],
      balance: balance.toString(),
    }));
}

async function getBalanceData(
  users: string[],
  pair: Pair,
  blocknumber: string,
  provider: ethers.providers.JsonRpcProvider
): Promise<BigNumber[]> {
  const calls = users.map((id: string) => ({
    methodName: "balanceOf(address)",
    methodParameters: [id],
  }));
  let results = await multicallSplitOnOverflow(
    pair.address,
    PAIR_ABI,
    calls,
    "SwapPair",
    provider,
    {
      maxCallsPerBatch: 300,
      blockNumber: blocknumber,
    }
  );
  let balance = results.map((result) => BigNumber.from(result[0].hex));
  if (pair.gaugeAddress) {
    const gaugeCalls = users.map((id: string) => ({
      methodName: "balanceOf(address)",
      methodParameters: [id],
    }));
    const gaugeResults = await multicallSplitOnOverflow(
      pair.gaugeAddress,
      GAUGE_ABI,
      gaugeCalls,
      "Gauge",
      provider,
      {
        maxCallsPerBatch: 300,
        blockNumber: blocknumber,
      }
    );
    balance = gaugeResults.map((result, index) =>
      BigNumber.from(result[0].hex).add(balance[index])
    );
  }
  return balance;
}

type UserData = {
  users: { address: string; balance: string }[];
};

task(
  "get-lp-balances",
  "Initial LP balances taken at the start of the period, this is used as the reference"
)
  .addParam("blocknumber", "Block Number")
  .setAction(async ({ blocknumber }, { network, ethers }) => {
    const userBalancesForPool: Record<string, UserData> = {};
    const validPools = [
      "0xb357449baDC51ff6070f93f312cA7eC7601545b5".toLowerCase(), // WETH-XCAL
      "0x2Cc6AC1454490AfA83333Fabc84345FaD751285B".toLowerCase(), // XCAL-USDC
      "0x2f4A5DA44639E9694319D518c8c40fbCEb3f2430".toLowerCase(), // ARB-XCAL
    ];
    const swapPairs = await allPairDataSwapWithGauge(network.name);
    const selectedPairs: Pair[] = swapPairs.filter((pair: Pair) =>
      validPools.includes(pair.address)
    );

    console.log(
      "Number of pools considered in the airdrop : ",
      selectedPairs.length
    );
    const blacklistedAddresses = selectedPairs
      .flatMap((pair) => (pair?.gaugeAddress ? [pair.gaugeAddress] : []))
      .concat("0x0000000000000000000000000000000000000000");

    const users = (
      await getUsers(network.name)
    ).flatMap(({ id }: { id: string }) =>
      blacklistedAddresses.includes(id) ? [] : [id]
    );

    console.log(
      "Number of users that have interacted with the contracts : ",
      users.length
    );

    for (var index = 0; index < selectedPairs.length; index++) {
      console.log("-------------------------");
      console.log(
        "Pool : ",
        selectedPairs[index].stable
          ? "sAMM-"
          : "vAMM-" +
              selectedPairs[index].token0.symbol +
              "/" +
              selectedPairs[index].token1.symbol
      );

      const balances = await getBalanceDataInFormat(
        users,
        selectedPairs[index],
        blocknumber,
        ethers.provider
      );

      console.log("Users : ", balances.length);

      userBalancesForPool[selectedPairs[index].address] = {
        users: balances,
      };
    }

    const filePath = path.join(
      __dirname,
      "output",
      "userBalancesSnapshot.json"
    );

    fs.writeFileSync(filePath, JSON.stringify(userBalancesForPool, null, 2));

    console.log(`Data saved to ${filePath}`);
  });
