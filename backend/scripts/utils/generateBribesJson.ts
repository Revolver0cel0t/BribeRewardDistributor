import { task } from "hardhat/config";
import fs from "fs";
import path from "path";
import ERC_20_ABI from "../../constants/abis/erc20ABI.json";
import axios from "axios";
import { BigNumber, Contract } from "ethers/lib/ethers";
import { getDefiLLamaPricing } from "../calculateAirdrop";
import { getAddress } from "ethers/lib/utils";

task("generate-bribe-json").setAction(async (_, { network, ethers }) => {
  const inputFilePath = path.join(__dirname, "input", "bribesInput.dsv");
  let text = fs.readFileSync(inputFilePath, "utf8");
  let input = text.trim().split("\n");
  const tokensAddresses = input[0].trim().split(" ");
  input = input.slice(1, input.length);
  let output: any = {};

  let tokens = [];

  let totals: number[] = [];

  for (let token of tokensAddresses) {
    const contract = new ethers.Contract(token, ERC_20_ABI, ethers.provider);
    let decimals = await contract.decimals();
    let symbol = await contract.symbol();
    let name = await contract.name();
    const tokenData = {
      decimals,
      symbol,
      name,
      address: token,
    };
    let tokensWithPricing = await getDefiLLamaPricing(
      {
        [token]: tokenData,
      },
      await ethers.provider.getBlockNumber(),
      ethers.provider
    );
    tokens.push({
      ...tokensWithPricing[token],
      price: tokensWithPricing[token]?.price ?? BigNumber.from("0"),
    });
  }

  for (let line of input) {
    const priceInfo = line.trim().split(" ");
    const key = getAddress(priceInfo[priceInfo.length - 1]);
    output[key] = {};
    for (let tokenIndex = 0; tokenIndex < priceInfo.length - 1; tokenIndex++) {
      const token = tokens[tokenIndex];
      const amt =
        Number(priceInfo[tokenIndex]) /
        Number(ethers.utils.formatEther(token.price));
      totals[tokenIndex] = (totals[tokenIndex] ?? 0) + amt;
      output[key][token.address] = {
        decimals: token.decimals,
        symbol: token.symbol,
        amount: amt.toString(),
      };
    }
  }

  console.log(totals);

  const outputFilePath = path.join(__dirname, "output", "bribes.json");
  fs.writeFileSync(outputFilePath, JSON.stringify(output));

  console.log("Done.");
});
