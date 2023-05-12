import { task } from "hardhat/config";
import fs from "fs";
import path from "path";
import { BigNumber, ethers } from "ethers";
import MINTER_ABI from "../../constants/abis/minterABI.json";
import { MINTER_ADDRESS, VE_ADDRESS } from "../../constants";
import { GOV_TOKEN_ADDRESS } from "../../constants";
import GOV_TOKEN_ABI from "../../constants/abis/erc20ABI.json";
import VE_ABI from "../../constants/abis/veABI.json";

// const DURATION = 604800; //7 days
const BOOST_DURATION = 26; //26 weeks
const LM_TARGET = BigNumber.from("369")
  .mul(ethers.utils.parseEther("27000000"))
  .div("1000");
const TAIL_EMISSION = BigNumber.from("3");
const TAIL_BASE = BigNumber.from("1000");
const TARGET_BASE = BigNumber.from("10000");

// calculate circulating supply as total token supply - locked supply
function circulatingSupply(
  totalSupply: BigNumber,
  subtracted: BigNumber,
  lockedSupply: BigNumber
) {
  // let _substracted = substracted();
  // (_token.totalSupply() - _substracted) - _ve.totalSupply()
  return totalSupply.sub(subtracted).sub(lockedSupply);
}

// emission calculation is 1% of available supply to mint adjusted by circulating / total supply
function _calculateEmission(
  weekly: BigNumber,
  decay: BigNumber,
  targetBase: BigNumber,
  totalSupply: BigNumber,
  lockedSupply: BigNumber,
  subtracted: BigNumber
) {
  return weekly
    .mul(decay.mul(circulatingSupply(totalSupply, subtracted, lockedSupply)))
    .div(targetBase)
    .div(totalSupply.sub(subtracted));
}

// emission calculation is 1% of available supply to mint adjusted by circulating / total supply
function calculateEmission(
  weekly: BigNumber,
  decay: BigNumber,
  targetBase: BigNumber,
  totalSupply: BigNumber,
  lockedSupply: BigNumber,
  subtracted: BigNumber,
  boost: BigNumber
) {
  let emission = _calculateEmission(
    weekly,
    decay,
    targetBase,
    totalSupply,
    lockedSupply,
    subtracted
  );
  return emission.add(boost);
}

// calculates tail end (infinity) decay as 0.3% of total supply
function circulatingEmission(boost: BigNumber) {
  return LM_TARGET.mul(TAIL_EMISSION).div(TAIL_BASE).add(boost);
}

// weekly emission takes the max of calculated (aka target) emission versus circulating tail end emission
function weeklyEmission(
  weekly: BigNumber,
  decay: BigNumber,
  targetBase: BigNumber,
  totalSupply: BigNumber,
  lockedSupply: BigNumber,
  subtracted: BigNumber,
  boost: BigNumber
) {
  const emission = calculateEmission(
    weekly,
    decay,
    targetBase,
    totalSupply,
    lockedSupply,
    subtracted,
    boost
  );
  const circulatingEmissions = circulatingEmission(boost);
  return emission.gt(circulatingEmissions) ? emission : circulatingEmissions;
}

function calculateGrowth(
  substracted: BigNumber,
  lockedSupply: BigNumber,
  minted: BigNumber,
  totalSupply: BigNumber
) {
  return lockedSupply.mul(minted).div(totalSupply.sub(substracted));
}

//NOTE: you have to be on a local forked version of arbitrum to run this
task(
  "calculate-emissions",
  "Used to calculate the emissions for the next 26 weeks"
)
  .addParam("decay", "Emissions decay")
  .addParam("boost", "Emissions boost")
  .addOptionalParam(
    "rebasepercentage",
    "The percentage of the rebase that has been claimed" //This only gets used when theres no lockIncrease percentage mentioned for that epoch(lockIncreases.json)
  )
  .setAction(async ({ decay, boost, rebasepercentage }, { ethers }) => {
    const lockIncreaseFilePath = path.join(
      __dirname,
      "input",
      "lockIncreases.json"
    );
    const lockIncreases = JSON.parse(
      fs.readFileSync(lockIncreaseFilePath).toString()
    );

    const minter = new ethers.Contract(
      MINTER_ADDRESS[42161],
      MINTER_ABI,
      ethers.provider
    );

    const token = new ethers.Contract(
      GOV_TOKEN_ADDRESS[42161],
      GOV_TOKEN_ABI,
      ethers.provider
    );

    const votingEscrow = new ethers.Contract(
      VE_ADDRESS[42161],
      VE_ABI,
      ethers.provider
    );

    let filename = `${decay}_${boost}_${rebasepercentage ?? 0}_${new Date()}`;
    let filePath = path.join(__dirname, "output", `${filename}.csv`);

    decay = BigNumber.from("100").sub(decay).mul("100");
    boost = ethers.utils.parseEther(boost);

    //get initial weekly emissions
    let weekly: BigNumber = await minter.weekly();

    //total supply before boost
    let totalSupply: BigNumber = await token.totalSupply();
    let initialSupply = totalSupply;
    const substractedAddresses: string[] =
      await minter.getSubstractedAddresses();
    let subtracted = BigNumber.from("0");
    for (let index = 0; index < substractedAddresses.length; index++) {
      subtracted = subtracted.add(
        await token.balanceOf(substractedAddresses[index])
      );
    }

    console.log("Initial Substracted", ethers.utils.formatEther(subtracted));

    //locked supply before boost
    let lockedSupply: BigNumber = await votingEscrow.totalSupply();

    console.log(
      "Initial Total Supply : ",
      ethers.utils.formatEther(totalSupply)
    );

    const csv = `EPOCH,SUPPLY MINTED\n`;
    fs.appendFileSync(filePath, csv);

    for (let index = 0; index < BOOST_DURATION; index++) {
      if (totalSupply.gt(ethers.utils.parseEther("27000000")))
        throw new Error("Total supply exceeded");
      console.log(`----------EPOCH - ${index + 1} Data----------`);
      weekly = weeklyEmission(
        weekly,
        decay,
        TARGET_BASE,
        totalSupply,
        lockedSupply,
        subtracted,
        boost
      );
      console.log("Emissions : ", ethers.utils.formatEther(weekly));

      const rebaseEmissions: BigNumber = calculateGrowth(
        subtracted,
        lockedSupply,
        weekly,
        totalSupply
      );

      totalSupply = totalSupply.add(weekly);

      const percentage = lockIncreases[index];
      if (percentage)
        console.log("Extra increase in locks by  : ", percentage, "%");

      lockedSupply = percentage
        ? lockedSupply.mul(percentage).div(100).add(lockedSupply)
        : lockedSupply.add(rebaseEmissions.mul(rebasepercentage ?? 0).div(100));

      if (lockedSupply.gt(totalSupply))
        throw new Error("Locked supply cannot exceed total supply");

      console.log(
        "Total supply after flip : ",
        ethers.utils.formatEther(totalSupply)
      );
      console.log(
        "Locked supply after flip : ",
        ethers.utils.formatEther(lockedSupply)
      );

      const csv = `${index + 1},${ethers.utils.formatEther(weekly)}\n`;
      fs.appendFileSync(filePath, csv);
    }

    const amountMinted = totalSupply.sub(initialSupply);

    console.log(
      "Total XCAL minted during the 26 weeks : ",
      ethers.utils.formatEther(amountMinted)
    );

    fs.appendFileSync(
      filePath,
      `Total Minted : ,${ethers.utils.formatEther(amountMinted)}`
    );
  });
