import { BigNumber, ethers } from "ethers";
import fs from "fs";
import { task } from "hardhat/config";
import path from "path";
import TOKEN_ABI from "../../constants/abis/tokenABI.json";
import { multicallSplitOnOverflow } from "../../lib/multicall";
import { getUsers } from "../../subgraph/fetchers";

async function getBalanceData(
  users: string[],
  pair: string,
  blocknumber: string,
  provider: ethers.providers.JsonRpcProvider
): Promise<{ address: string; balance: string }[]> {
  const calls = users.map((id: string) => ({
    methodName: "balanceOf(address)",
    methodParameters: [id],
  }));
  let results = await multicallSplitOnOverflow(
    pair,
    TOKEN_ABI,
    calls,
    "Token",
    provider,
    {
      maxCallsPerBatch: 300,
      blockNumber: blocknumber,
    }
  );

  const userBalances = results
    .map((result, index) => ({
      address: users[index],
      balance: BigNumber.from(result[0].hex).toString(),
    }))
    .filter((user) => BigNumber.from(user.balance).gt(0));

  userBalances.sort((a, b) => {
    const balanceA = BigNumber.from(a.balance);
    const balanceB = BigNumber.from(b.balance);
    return balanceB.sub(balanceA).isNegative()
      ? -1
      : balanceA.sub(balanceB).isNegative()
      ? 1
      : 0;
  });

  return userBalances;
}

task("get-token-snapshot", "Token holdings at blocknumber")
  .addParam("blocknumber", "Block Number")
  .setAction(async ({ blocknumber }, { network, ethers }) => {
    const users = await getUsers(network.name);
    const balances = await getBalanceData(
      users
        ?.filter(
          (user: any) =>
            user?.id !== "0x0000000000000000000000000000000000000000"
        )
        ?.map((user: any) => user?.id),
      "0xd2568acCD10A4C98e87c44E9920360031ad89fCB",
      "117565640",
      ethers.provider
    );

    const outputFilePath = path.join(
      __dirname,
      "output",
      "userBalancesSnapshotForToken.json"
    );

    fs.writeFileSync(outputFilePath, JSON.stringify(balances, null, 2));

    console.log(`Data saved to ${outputFilePath}`);
  });
