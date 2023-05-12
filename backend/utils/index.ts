import { BigNumber, ethers } from "ethers";
import { DURATION } from "../constants";

export const convertStringToBn = (val: string) => ethers.utils.parseEther(val);

export const convertBnToString = (val: BigNumber) =>
  ethers.utils.formatEther(val);

export const getCurrentEpochTimestamp = (): number => 1679529600;

// 9th - 16th - end block.timestamp : 1676505600 , blocknumber: 61294083
// 16th - 23th - end block.timestamp : 1677110400 , blocknumber: 63595837
// 23rd - 2nd - end block.timestamp : 1677715200 , blocknumber: 65886487
// 2nd - 9th - end block.timestamp : 1678320000 , blocknumber: 68048127
// 9th - 16th - end block.timestamp : 1678924800 , blocknumber: 70234983
// 16th - 23rd - end block.timestamp : 1679529600, blocknumber: 72639581
// 23rd - 30th - end block.timestamp : 1680134400, blocknumber: 75072631
// 30th - 5th - end block.timestamp : 1680739200, blocknumber: 77459926
// 6th - 13th - end block.timestamp : 1681387200, blocknumber:79843300
// 13th-20th - end block.timestamp : 1681948800, blocknumber:82253133
// 20th-27th - end block.timestamp : 1682553600,blocknumber:84651215
//27th-4th - end block.timestamp : 1683158400,blocknumber:87029800
// 4th-11th - end block.timestamp : 1683763200,blocknumber:89417006

//https://arb-goerli.g.alchemy.com/v2/0f8Dq7WAG_nfSlPUeoNCD7ZRN8XN5Kma
