import { task } from "hardhat/config";
import fs from "fs";
import path from "path";
import { allPairDataSwapWithGauge, getUsers } from "../../subgraph/fetchers";
import PAIR_ABI from "../../constants/abis/pairABI.json";
import GAUGE_ABI from "../../constants/abis/gaugeABI.json";
import { multicallSplitOnOverflow } from "../../lib/multicall";
import { BigNumber, ethers } from "ethers";
import { Pair, UserData } from ".";

//used to retrieve all users liq+gauge balances @ the given blocknumber
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

task(
  "get-all-users-initial",
  "Initial LP balances taken at the start of the period, this is used as the reference"
)
  .addParam("blocknumber", "Block Number")
  .addVariadicPositionalParam("addressesArray")
  .setAction(async ({ blocknumber, addressesArray }, { network, ethers }) => {
    let userBalancesForPool: Record<string, UserData> = {};
    const swapPairs = await allPairDataSwapWithGauge(network.name);
    const selectedPairs: Pair[] = swapPairs.filter((pair: Pair) =>
      addressesArray.includes(pair.address)
    );

    console.log(
      "Number of pools considered in the airdrop : ",
      selectedPairs.length
    );
    const blacklistedAddresses = selectedPairs
      .flatMap((pair) => (pair?.gaugeAddress ? [pair.gaugeAddress] : []))
      .concat("0x0000000000000000000000000000000000000000");
    //filter out the gauge contract from airdrop calculations
    const users = (await getUsers(network.name)).flatMap(
      ({ id }: { id: string }) =>
        blacklistedAddresses.includes(id) ? [] : [id]
    );
    console.log(
      "Number of users that have interacted with the contracts : ",
      users.length
    );
    let totalUsersIntial = 0;
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
      const balances = await getBalanceData(
        users,
        selectedPairs[index],
        blocknumber,
        ethers.provider
      );

      const filteredUsers: string[] = [];
      const filteredBalances: BigNumber[] = [];

      balances.forEach((balance, index) => {
        if (balance.gt(0)) {
          filteredUsers.push(users[index]);
          filteredBalances.push(balance);
        }
      });

      console.log("Users : ", filteredUsers.length);

      userBalancesForPool[selectedPairs[index].address] = {
        users: filteredUsers,
        balances: filteredBalances,
      };
      totalUsersIntial += filteredUsers.length;
    }

    console.log(
      "Total users considered for initial snapshot : ",
      totalUsersIntial
    );

    const filePath = path.join(
      __dirname,
      "output",
      "userBalancesSnapshot.json"
    );
    fs.writeFileSync(filePath, JSON.stringify(userBalancesForPool));
  });
