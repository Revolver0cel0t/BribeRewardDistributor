import { task } from "hardhat/config";
import { GOV_TOKEN_ADDRESS, MINTER_ADDRESS } from "../../constants";
import MINTER_ABI from "../../constants/abis/minterABI.json";
import ERC_20 from "../../constants/abis/erc20ABI.json";
import { BigNumber } from "ethers";

const WEEK = 86400 * 7;

//NOTE: you have to be on a local forked version of arbitrum to run this
task("emissions-sim-local", "Self explanatory")
  .addParam("decay", "Emissions decay")
  .addParam("boost", "Emissions boost")
  .setAction(async ({ decay, boost }, { ethers, network }) => {
    const accounts = await ethers.getSigners();

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0x5f49174FdEb42959f3234053b18F5c4ad497CC55"],
    });

    const token = new ethers.Contract(
      GOV_TOKEN_ADDRESS[42161],
      ERC_20,
      ethers.provider.getSigner()
    );

    const totalSupply: BigNumber = await token.totalSupply();
    const maxSupply = ethers.utils.parseEther("27000000");

    console.log(
      "Total supply before boost : ",
      ethers.utils.formatEther(totalSupply)
    );

    const minter = new ethers.Contract(
      MINTER_ADDRESS[42161],
      MINTER_ABI,
      ethers.provider.getSigner("0x5f49174FdEb42959f3234053b18F5c4ad497CC55")
    );
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [accounts[0].address],
    });

    const minterUser = new ethers.Contract(
      MINTER_ADDRESS[42161],
      MINTER_ABI,
      ethers.provider.getSigner(accounts[0].address)
    );
    await minter.setEmissions(
      BigNumber.from(decay),
      ethers.utils.parseEther(boost)
    );

    console.log("boost updated");

    let currentTime = BigNumber.from(Date.now()).div(1000).toNumber();

    let nextEpoch = BigNumber.from(currentTime)
      .div(WEEK)
      .mul(WEEK)
      .add(WEEK)
      .toNumber();

    let prevTotalSupply: BigNumber = totalSupply;

    for (let index = 0; index < 26; index++) {
      console.log("At epoch  :", index + 1, " : ", new Date(nextEpoch * 1000));
      const params = [
        ethers.utils.hexValue(nextEpoch - currentTime + 1), // hex encoded number of seconds
      ];
      await ethers.provider.send("evm_increaseTime", params);

      await minterUser.update_period();

      const currentTotalSupply: BigNumber = await token.totalSupply();

      console.log(
        "Emissions minted this epoch : ",
        ethers.utils.formatEther(currentTotalSupply.sub(prevTotalSupply))
      );
      console.log(
        "Current total Supply : ",
        ethers.utils.formatEther(currentTotalSupply)
      );
      console.log(
        "Distance to max total supply : ",
        ethers.utils.formatEther(maxSupply.sub(currentTotalSupply))
      );

      prevTotalSupply = currentTotalSupply;
      currentTime = nextEpoch;

      nextEpoch = nextEpoch + WEEK;
    }

    const totalSupplyNew: BigNumber = await token.totalSupply();

    console.log(
      "Total supply minted : ",
      ethers.utils.formatEther(totalSupplyNew)
    );

    console.log(
      "Emissions minted after 26 weeks : ",
      ethers.utils.formatEther(totalSupplyNew.sub(totalSupply))
    );
  });
