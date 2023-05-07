import { task } from "hardhat/config";
import fs from "fs";
import path from "path";
import {
  allPairDataSwapWithoutGauge,
  getLiqSnapshotsForPair,
  getTokenPriceUSD,
  getUsers,
} from "../../subgraph/fetchers";
import PAIR_ABI from "../../constants/abis/pairABI.json";
import ROUTER_ABI from "../../constants/abis/routerABI.json";
import GAUGE_ABI from "../../constants/abis/gaugeABI.json";
import { multicallSplitOnOverflow } from "../../lib/multicall";
import { BigNumber, ethers } from "ethers";
import { Network } from "hardhat/types";
import { ROUTER_ADDRESS } from "../../constants/addresses";

// "0xde9161d8b76dd0b9890bee442c3585857a1a1edf",arb/usdc
// "0x2f4a5da44639e9694319d518c8c40fbceb3f2430",arb/xcal
// "0xa84861b2ccce56c42f0ee21e62b74e45d6f90c6d",weth/arb

//77969151-blocknumber @April 7th 11:59pm UTC

type UserData = {
  users: string[];
  balances: BigNumber[];
  overflowBuffer?: BigNumber[];
};

type LiqSnapshot = {
  id: string;
  liquidityTokenBalance: string;
  gaugeBalance: string;
  user: {
    id: string;
  };
};

export type Token = {
  address: string;
  decimals: number;
  price?: BigNumber;
};

export type Pair = {
  address: string;
  gaugeAddress?: string;
  token0: Token;
  token1: Token;
  stable: boolean;
};

type AirdropAmounts = {
  [pair: string]: {
    [user: string]: BigNumber;
  };
};

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

async function getTokensWithPriceInfo(
  swapPairs: Pair[],
  addressesArray: string[],
  network: Network,
  blocknumber: number,
  provider: ethers.providers.JsonRpcProvider
) {
  const blocktimestamp = (await provider.getBlock(blocknumber)).timestamp;
  let tokenData: {
    [token: string]: Token;
  } = {};

  swapPairs.forEach((pair: Pair) => {
    if (addressesArray.includes(pair.address)) {
      if (!tokenData[pair.token0.address]) {
        tokenData[pair.token0.address] = {
          ...pair.token0,
          price: BigNumber.from(0),
        };
      }
      if (!tokenData[pair.token1.address]) {
        tokenData[pair.token1.address] = {
          ...pair.token0,
          price: BigNumber.from(0),
        };
      }
    }
  });

  const tokenKeys = Object.keys(tokenData);
  const prices = await Promise.all(
    tokenKeys.map(
      async (token) =>
        await getTokenPriceUSD(network.name, blocktimestamp, tokenData[token])
    )
  );
  prices.forEach((price, index) => {
    const tokenInfo = tokenData[tokenKeys[index]];
    tokenData[tokenKeys[index]] = { ...tokenInfo, price };
  });

  return tokenData;
}

async function getAmountUSDPerUser(
  userData: AirdropAmounts,
  pairs: Pair[],
  tokenDatas: {
    [token: string]: Token;
  },
  provider: ethers.providers.JsonRpcProvider,
  blocknumber: string
) {
  let userUSDAmounts: {
    [user: string]: BigNumber;
  } = {};
  let totalAmount = BigNumber.from("0");

  for (var index = 0; index < pairs.length; index++) {
    const pair = pairs[index];
    const users = userData[pair.address];

    const userKeys = Object.keys(users);

    const calls = userKeys.map((user: string) => ({
      methodName: "quoteRemoveLiquidity(address,address,bool,uint256)",
      methodParameters: [
        pair.token0.address,
        pair.token1.address,
        pair.stable,
        users[user],
      ],
    }));

    let results = await multicallSplitOnOverflow(
      ROUTER_ADDRESS,
      ROUTER_ABI,
      calls,
      "Router",
      provider,
      {
        maxCallsPerBatch: 300,
        blockNumber: blocknumber,
      }
    );

    const token0Price = tokenDatas[pair.token0.address].price as BigNumber;
    const token1Price = tokenDatas[pair.token1.address].price as BigNumber;

    results.forEach((result, index) => {
      if (!userUSDAmounts[userKeys[index]])
        userUSDAmounts[userKeys[index]] = BigNumber.from("0");
      userUSDAmounts[userKeys[index]] = userUSDAmounts[userKeys[index]].add(
        BigNumber.from(result[0].hex)
          .mul(token0Price)
          .add(BigNumber.from(result[1].hex).mul(token1Price))
      );
      totalAmount = totalAmount.add(userUSDAmounts[userKeys[index]]);
    });
  }
  return { userUSDAmounts, totalAmount };
}

task(
  "get-all-users-initial",
  "Initial LP balances taken at the start of the period, this is used as the reference"
)
  .addParam("blocknumber", "Block Number")
  .addVariadicPositionalParam("addressesArray")
  .setAction(async ({ blocknumber, addressesArray }, { network, ethers }) => {
    let userBalancesForPool: Record<string, UserData> = {};
    const swapPairs = await allPairDataSwapWithoutGauge(network.name);
    const selectedPairs: Pair[] = swapPairs.filter((pair: Pair) =>
      addressesArray.includes(pair.address)
    );
    const users = (await getUsers(network.name, blocknumber)).map(
      ({ id }: { id: string }) => id
    );
    for (var index = 0; index < addressesArray.length; index++) {
      const balances = await getBalanceData(
        users,
        selectedPairs.filter(
          (pair) => pair.address === addressesArray[index]
        )[0],
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

      userBalancesForPool[addressesArray[index]] = {
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

task(
  "get-final-balances",
  "Final balance at the end, taking into account inward and outward transfers after the snapshot period"
)
  .addParam("blocknumber", "Block Number")
  .addVariadicPositionalParam("addressesArray")
  .setAction(async ({ blocknumber, addressesArray }, { network, ethers }) => {
    const filePath = path.resolve(
      __dirname,
      "output/userBalancesSnapshot.json"
    );
    const userData = JSON.parse(fs.readFileSync(filePath).toString());

    let allBalances: AirdropAmounts = {};

    for (var index = 0; index < addressesArray.length; index++) {
      const { users, balances }: UserData = userData[addressesArray[index]];
      const allLiqSnapshots = await getLiqSnapshotsForPair(
        network.name,
        blocknumber,
        addressesArray[index]
      );
      allBalances[addressesArray[index]] = {};
      users.forEach((user, jindex) => {
        let userFinalBalance = BigNumber.from(balances[jindex]);
        let overflow = BigNumber.from(0);
        allLiqSnapshots.forEach((snapshot: LiqSnapshot) => {
          if (
            snapshot.user.id === user &&
            user !== "0x0000000000000000000000000000000000000000"
          ) {
            const liqBalanceBN = ethers.utils.parseEther(
              snapshot.liquidityTokenBalance
            );
            const gaugeBalanceBN = ethers.utils.parseEther(
              snapshot.gaugeBalance
            );
            let delta = userFinalBalance
              .mul(-1)
              .add(liqBalanceBN)
              .add(gaugeBalanceBN);
            overflow = overflow.add(delta);
            if (overflow.lt(0)) {
              userFinalBalance = userFinalBalance.add(overflow);
              overflow = BigNumber.from("0");
            }
          }
        });
        if (userFinalBalance.gt(0)) {
          allBalances[addressesArray[index]][user] = userFinalBalance;
        }
      });
    }

    console.log(Object.keys(allBalances).length);

    const outFilePath = path.resolve(
      __dirname,
      "output/userBalancesFinal.json"
    );
    fs.writeFileSync(outFilePath, JSON.stringify(allBalances));
  });

task("get-airdrop-amounts", "Used to calculate the final distribution")
  .addParam("blocknumber", "Block Number")
  .addParam("airdroptoken", "Token to airdrop")
  .addParam("airdropamount", "Amount to airdrop in wei")
  .addParam("decimals", "Decimals of token to airdrop")
  .addVariadicPositionalParam("addressesArray")
  .setAction(
    async (
      { blocknumber, addressesArray, airdropamount },
      { network, ethers }
    ) => {
      const filePath = path.resolve(__dirname, "output/userBalancesFinal.json");
      const userData = JSON.parse(fs.readFileSync(filePath).toString());

      const swapPairs: Pair[] = (
        await allPairDataSwapWithoutGauge(network.name)
      ).filter((pair: Pair) => addressesArray.includes(pair.address));

      let airdropPerUser: {
        [user: string]: BigNumber;
      } = {};
      let tokenDatas = await getTokensWithPriceInfo(
        swapPairs,
        addressesArray,
        network,
        Number(blocknumber),
        ethers.provider
      );

      const { userUSDAmounts, totalAmount } = await getAmountUSDPerUser(
        userData,
        swapPairs,
        tokenDatas,
        ethers.provider,
        blocknumber
      );

      let airdropTotal = BigNumber.from("0");
      Object.keys(userUSDAmounts).forEach((user, index) => {
        const ratio = userUSDAmounts[user]
          .mul(ethers.utils.parseEther("1"))
          .div(totalAmount);

        airdropPerUser[user] = ratio
          .mul(airdropamount)
          .div(ethers.utils.parseEther("1"));
        airdropTotal = airdropTotal.add(airdropPerUser[user]);
      });
      const outFilePath = path.resolve(__dirname, "output/final.json");
      fs.writeFileSync(outFilePath, JSON.stringify(airdropPerUser));
    }
  );
