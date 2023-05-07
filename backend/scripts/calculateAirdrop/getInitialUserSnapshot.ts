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
    const calls = users.map((id: string) => ({
      methodName: "balanceOf(address)",
      methodParameters: [id],
    }));
    const gaugeResults = await multicallSplitOnOverflow(
      pair.gaugeAddress,
      GAUGE_ABI,
      calls,
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
    const users = (await getUsers(network.name, blocknumber)).map(
      ({ id }: { id: string }) => id
    );
    for (var index = 0; index < selectedPairs.length; index++) {
      const balances = await getBalanceData(
        users,
        selectedPairs[index],
        blocknumber,
        ethers.provider
      );

      const filteredUsers: string[] = [];

      const filteredBalances = balances.filter((balance, index) => {
        if (balance.gt(0)) {
          filteredUsers.push(users[index]);
          return true;
        }
      });

      userBalancesForPool[selectedPairs[index].address] = {
        users: filteredUsers,
        balances: filteredBalances,
      };
    }
    const filePath = path.join(
      __dirname,
      "output",
      "userBalancesSnapshot.json"
    );
    fs.writeFileSync(filePath, JSON.stringify(userBalancesForPool));
  });
