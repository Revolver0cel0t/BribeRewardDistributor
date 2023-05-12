import { task } from "hardhat/config";
import fs from "fs";
import path from "path";
import { allPairDataSwapWithGauge } from "../../subgraph/fetchers";
import ROUTER_ABI from "../../constants/abis/routerABI.json";
import { multicallSplitOnOverflow } from "../../lib/multicall";
import { BigNumber, ethers } from "ethers";
import { ROUTER_ADDRESS } from "../../constants/addresses";
import { getAddress } from "ethers/lib/utils";
import axios from "axios";

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
  symbol: string;
};

export type AirdropAmounts = {
  [pair: string]: {
    [user: string]: BigNumber;
  };
};

const getDefiLLamaQuery = (addresses: string[]) => {
  let query = "";
  for (let index = 0; index < addresses.length; index++) {
    if (index !== 0) {
      query += ",";
    }
    query += `arbitrum:${getAddress(addresses[index])}`;
  }
  return query;
};

async function getDefiLLamaPricing(
  tokenData: { [token: string]: Token },
  blocknumber: number,
  provider: ethers.providers.JsonRpcProvider
) {
  const priceKeys = Object.keys(tokenData);

  const blocktimestamp = (await provider.getBlock(blocknumber)).timestamp;
  const date = new Date(blocktimestamp * 1000);
  const query = getDefiLLamaQuery(priceKeys);

  const response = await axios.get(
    `https://coins.llama.fi/prices/historical/${blocktimestamp}/${query}`
  );
  const result: any = await response.data;
  const coins = result?.coins ?? {};
  console.log(`Prices at : ${date}`);
  for (let index = 0; index < priceKeys.length; index++) {
    const tokenKey = priceKeys[index];
    const coinData = coins[`arbitrum:${getAddress(tokenKey)}`];
    if (coinData && coinData.confidence > 0.75) {
      console.log(`${tokenData[tokenKey].symbol} - ${coinData.price}`);
      tokenData[tokenKey] = {
        ...tokenData[tokenKey],
        // all usdc prices will have 18 decimals
        price: ethers.utils.parseEther(coinData.price.toString()),
      };
    } else {
      throw new Error("No coin price available");
    }
  }

  return tokenData;
}

async function getTokensWithPriceInfo(
  swapPairs: Pair[],
  addressesArray: string[]
  // network: Network,
  // blocknumber: number,
  // provider: ethers.providers.JsonRpcProvider
) {
  // const blocktimestamp = (await provider.getBlock(blocknumber)).timestamp;
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

  // const tokenKeys = Object.keys(tokenData);
  // const prices = await Promise.all(
  //   tokenKeys.map(
  //     async (token) =>
  //       await getTokenPriceUSD(network.name, blocktimestamp, tokenData[token])
  //   )
  // );
  // prices.forEach((price, index) => {
  //   const tokenInfo = tokenData[tokenKeys[index]];
  //   tokenData[tokenKeys[index]] = { ...tokenInfo, price };
  // });

  // console.log("Token data at : ", new Date(blocktimestamp * 1000));

  // Object.keys(tokenData).forEach((address) => {
  //   console.log(
  //     tokenData[address].symbol,
  //     " : ",
  //     ethers.utils.formatEther(tokenData[address].price as BigNumber)
  //   );
  // });

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
      //normalize all tokens to 18 decimals, for purpose of converting it to its usdc value(and to be able to add all usdc amounts together)
      const token0Amount = BigNumber.from(result[0].hex).mul(
        ethers.utils.parseUnits("1", 18 - Number(pair.token0.decimals))
      );
      const token1Amount = BigNumber.from(result[1].hex).mul(
        ethers.utils.parseUnits("1", 18 - Number(pair.token1.decimals))
      );
      const usdcAmount = token0Amount
        .mul(token0Price)
        .div(ethers.utils.parseEther("1"))
        .add(token1Amount.mul(token1Price).div(ethers.utils.parseEther("1")));
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
      let tokenDatas = await getTokensWithPriceInfo(swapPairs, addressesArray);

      tokenDatas = await getDefiLLamaPricing(
        tokenDatas,
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

      let prettyPrintedFinal: any = {
        "User Address": [],
        "Arb airdrop amount": [],
      };
      Object.keys(airdropPerUser).forEach((val) => {
        prettyPrintedFinal["User Address"].push(val);
        prettyPrintedFinal["Arb airdrop amount"].push(
          ethers.utils.formatUnits(airdropPerUser[val], 18)
        );
      });

      const outFilePath = path.resolve(__dirname, "output/final.json");
      fs.writeFileSync(outFilePath, JSON.stringify(airdropPerUser));
      const prettyFilePath = path.resolve(__dirname, "output/prettyFinal.json");
      fs.writeFileSync(prettyFilePath, JSON.stringify(prettyPrintedFinal));
    }
  );

task("get-divided-amount", "Used to calculate the final distribution")
  .addParam("multiplier", "multiplier")
  .setAction(async ({ multiplier }, { network, ethers }) => {
    const filePath = path.resolve(__dirname, "output/final.json");
    let final = JSON.parse(fs.readFileSync(filePath).toString());

    const multiplierBn = ethers.utils.parseEther(multiplier);

    let total = BigNumber.from("0");
    Object.keys(final).forEach((user) => {
      const amt = multiplierBn
        .mul(final[user])
        .div(ethers.utils.parseEther("1"));
      total = total.add(amt);
      final[user] = amt.toString();
    });

    console.log(ethers.utils.formatEther(total));

    const dividedFinal = path.resolve(__dirname, "output/dividedFinal.json");
    fs.writeFileSync(dividedFinal, JSON.stringify(final));
  });

task("get-formatted-amount", "Used to input into the merkle proof script")
  .addParam("token", "Token to distribute")
  .setAction(async ({ token }, { network, ethers }) => {
    const filePath = path.resolve(__dirname, "output/dividedFinal.json");
    const final = JSON.parse(fs.readFileSync(filePath).toString());

    const checksummedToken = getAddress(token);

    let formattedFinal: any = {};

    Object.keys(final).forEach((user) => {
      formattedFinal[getAddress(user)] = {
        [checksummedToken]: final[user],
      };
    });

    const dividedFinal = path.resolve(__dirname, "output/formattedFinal.json");
    fs.writeFileSync(dividedFinal, JSON.stringify(formattedFinal));
  });

task("verify-airdrop", "Verification").setAction(
  async ({ token }, { network, ethers }) => {
    const filePath = path.resolve(
      __dirname,
      "../generateMerkleTree/output/airdropProofs.json"
    );
    const file = JSON.parse(fs.readFileSync(filePath).toString());
    const filePath1 = path.resolve(__dirname, "./output/final.json");
    const file1 = JSON.parse(fs.readFileSync(filePath1).toString());

    let total = BigNumber.from("0");
    Object.keys(file["ARB-AIRDROP-1"]).forEach((user) => {
      if (user !== "root") {
        const bamt = BigNumber.from(
          file["ARB-AIRDROP-1"][user].rewardInfo.amounts[0]
        );
        total = total.add(bamt);
        if (
          !bamt.eq(
            ethers.utils
              .parseEther("0.25")
              .mul(file1[user.toLowerCase()])
              .div(ethers.utils.parseEther("1"))
          )
        ) {
          throw new Error("weee");
        }
      }
    });
    console.log(ethers.utils.formatEther(total));
  }
);
