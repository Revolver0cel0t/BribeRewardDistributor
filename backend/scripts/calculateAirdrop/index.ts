import { task } from "hardhat/config";
import fs from "fs";
import path from "path";
import {
  allPairDataSwapWithGauge,
  getTokenPriceUSD,
} from "../../subgraph/fetchers";
import ROUTER_ABI from "../../constants/abis/routerABI.json";
import { multicallSplitOnOverflow } from "../../lib/multicall";
import { BigNumber, ethers } from "ethers";
import { Network } from "hardhat/types";
import { ROUTER_ADDRESS } from "../../constants/addresses";

// "0xde9161d8b76dd0b9890bee442c3585857a1a1edf",arb/usdc
// "0x2f4a5da44639e9694319d518c8c40fbceb3f2430",arb/xcal
// "0xa84861b2ccce56c42f0ee21e62b74e45d6f90c6d",weth/arb
//77969151-blocknumber @April 7th 11:59pm UTC
//87371188-blocknumber @May 5th 00:00UTC

// Object.defineProperties(BigNumber.prototype, {
//   toReadable: {
//     value: function (this: BigNumber) {
//       return ethers.utils.formatUnits(this, 18);
//     },
//   },
// });

export type UserData = {
  users: string[];
  balances: BigNumber[];
  overflowBuffer?: BigNumber[];
};

export type LiqSnapshot = {
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
  symbol: string;
};

export type Pair = {
  address: string;
  gaugeAddress?: string;
  token0: Token;
  token1: Token;
  stable: boolean;
};

export type AirdropAmounts = {
  [pair: string]: {
    [user: string]: BigNumber;
  };
};

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
          ...pair.token1,
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

  console.log("Token data at : ", new Date(blocktimestamp * 1000));

  Object.keys(tokenData).forEach((address) => {
    console.log(
      tokenData[address].symbol,
      " : ",
      ethers.utils.formatEther(tokenData[address].price as BigNumber)
    );
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

    const token0Price = (
      tokenDatas[pair.token0.address].price as BigNumber
    ).mul(ethers.utils.parseUnits("1", 18 - Number(pair.token0.decimals)));
    const token1Price = (
      tokenDatas[pair.token1.address].price as BigNumber
    ).mul(ethers.utils.parseUnits("1", 18 - Number(pair.token1.decimals)));

    results.forEach((result, index) => {
      if (!userUSDAmounts[userKeys[index]])
        userUSDAmounts[userKeys[index]] = BigNumber.from("0");
      const usdcAmount = BigNumber.from(result[0].hex)
        .mul(token0Price)
        .div(ethers.utils.parseEther("1"))
        .add(
          BigNumber.from(result[1].hex)
            .mul(token1Price)
            .div(ethers.utils.parseEther("1"))
        );
      userUSDAmounts[userKeys[index]] =
        userUSDAmounts[userKeys[index]].add(usdcAmount);
      totalAmount = totalAmount.add(usdcAmount);
    });
  }
  return { userUSDAmounts, totalAmount };
}

task("get-airdrop-amounts", "Used to calculate the final distribution")
  .addParam("blocknumber", "Block Number")
  .addParam("airdropamount", "Amount to airdrop in wei")
  .addVariadicPositionalParam("addressesArray")
  .setAction(
    async (
      { blocknumber, addressesArray, airdropamount },
      { network, ethers }
    ) => {
      const filePath = path.resolve(__dirname, "output/userBalancesFinal.json");
      const userData = JSON.parse(fs.readFileSync(filePath).toString());

      const swapPairs: Pair[] = (
        await allPairDataSwapWithGauge(network.name)
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
      Object.keys(userUSDAmounts).forEach((user) => {
        const ratio = userUSDAmounts[user]
          .mul(ethers.utils.parseEther("1"))
          .div(totalAmount);

        const tokenAmount = ratio
          .mul(airdropamount)
          .div(ethers.utils.parseEther("1"));

        //to filter out amounts lower than 18 decimals
        if (tokenAmount.gt(0)) {
          airdropPerUser[user] = tokenAmount;
          airdropTotal = airdropTotal.add(airdropPerUser[user]);
        }
      });

      console.log(
        "Total users eligible : ",
        Object.keys(airdropPerUser).length
      );

      console.log(
        "Total LP USD amount at snapshot : ",
        ethers.utils.formatEther(totalAmount)
      );

      console.log(
        "Total token being distributed : ",
        ethers.utils.formatEther(airdropTotal)
      );

      const outFilePath = path.resolve(__dirname, "output/final.json");
      fs.writeFileSync(outFilePath, JSON.stringify(airdropPerUser));
    }
  );
