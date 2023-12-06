import { BigNumber } from "ethers";
import fs from "fs";
import { task } from "hardhat/config";
import path from "path";
import { VE_ADDRESS } from "../../constants";
import VE_ABI from "../../constants/abis/veABI.json";
import { multicallSplitOnOverflow } from "../../lib/multicall";
import { getLocks } from "../../subgraph/fetchers";
import { convertLength } from "@mui/material/styles/cssUtils";

Object.defineProperties(BigNumber.prototype, {
  toJSON: {
    value: function(this: BigNumber) {
      return this.toString();
    },
  },
});

async function getMultipleLocksAmts(
  locks: any[],
  chainId: number,
  provider: any,
  blocknumber: string
) {
  const weightCalls = locks.map(({ tokenId }: { tokenId: number }) => ({
    methodName: "balanceOfNFT(uint256)",
    methodParameters: [tokenId],
  }));
  const results = await multicallSplitOnOverflow(
    VE_ADDRESS[chainId],
    VE_ABI,
    weightCalls,
    "VotingEscrow",
    provider,
    {
      maxCallsPerBatch: 100,
      blockNumber: blocknumber,
    }
  );
  const convertedResults = results.map((result) =>
    BigNumber.from(result[0]?.hex)
  );
  return convertedResults;
}

task("get-ve-balances", "Locked stats at blocknumber")
  .addParam("blocknumber", "Block Number")
  .setAction(async ({ blocknumber }, { network, ethers }) => {
    const chainId = 42161;
    const locks = await getLocks(network.name, blocknumber);

    console.log("Total locks : ", locks.length);
    const allLockAmounts = await getMultipleLocksAmts(
      locks,
      chainId,
      ethers.provider,
      blocknumber
    );

    const totalVotingPower = allLockAmounts.reduce(
      (prev, acc) => prev.add(acc),
      BigNumber.from(0)
    );

    const lockSnapshot: Record<string, any> = {};
    const lockSnapshotPretty: Record<string, any> = {};
    allLockAmounts.forEach((value, index) => {
      if (!lockSnapshot[locks[index].owner]) {
        lockSnapshot[locks[index].owner] = {};
      }
      const totalLockAmount = value.add(
        lockSnapshot[locks[index].owner]?.lockAmount ?? 0
      );
      const lockPercentage = totalLockAmount
        .mul(ethers.utils.parseEther("1"))
        .div(totalVotingPower);
      lockSnapshot[locks[index].owner] = {
        lockAmount: totalLockAmount,
        lockPercentage,
      };
      const lockPercentagePretty =
        Number(ethers.utils.formatEther(totalLockAmount)) /
        Number(ethers.utils.formatEther(totalVotingPower));
      lockSnapshotPretty[locks[index].owner] = {
        lockAmount: ethers.utils.formatEther(totalLockAmount),
        lockPercentage: lockPercentagePretty * 100,
      };
    });

    const percentage = Object.keys(lockSnapshotPretty).reduce(
      (prev, curr) => prev + lockSnapshotPretty[curr].lockPercentage,
      0
    );

    console.log("Total percentage : ", percentage);
    const totalFilePath = path.join(__dirname, "output", "snapshot.json");
    fs.writeFileSync(totalFilePath, JSON.stringify(lockSnapshot));
    const totalFilePathPretty = path.join(
      __dirname,
      "output",
      "snapshotPretty.json"
    );
    fs.writeFileSync(totalFilePathPretty, JSON.stringify(lockSnapshotPretty));

    console.log("Done");
  });
