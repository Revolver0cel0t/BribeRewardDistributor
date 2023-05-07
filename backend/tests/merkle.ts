import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { expect } from "chai";
describe("Merkle claim", async () => {
  let owner, alice, bob, carol;
  let claim, xcal, usdc;
  let rootHash;
  let tokens;
  let aliceProof, bobProof;
  let aliceLeaf, bobLeaf;
  let leafs;

  const aliceAmounts = [150, 300];
  const bobAmounts = [50, 100];

  before(async () => {
    [owner, alice, bob, carol] = await ethers.getSigners();

    const MerkleClaim = await ethers.getContractFactory(
      "MerkleClaimMultipleERC20"
    );

    const MockXCAL = await ethers.getContractFactory("MockXCAL");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");

    xcal = await MockXCAL.deploy();
    console.log();
    console.log("MockXCAL deployed");
    usdc = await MockUSDC.deploy();
    console.log("MockUSDC deployed");

    tokens = [xcal.address, usdc.address];

    aliceLeaf = [tokens, aliceAmounts, alice.address];
    bobLeaf = [tokens, bobAmounts, bob.address];

    leafs = [aliceLeaf, bobLeaf];

    const exampleMerkleTree = StandardMerkleTree.of(leafs, [
      "address[]",
      "uint256[]",
      "address",
    ]);
    rootHash = exampleMerkleTree.root;
    claim = await MerkleClaim.deploy(rootHash);
    console.log("Merkle claim deployed");
    console.log();

    // pass merkletree object and string leaf, returns array of strings
    const getProofFromHexLeaf = (tree, leaf) => {
      for (const [i, v] of tree.entries()) {
        if (v[2] === leaf[2]) {
          return tree.getProof(i);
        }
      }
    };

    aliceProof = getProofFromHexLeaf(exampleMerkleTree, aliceLeaf);

    bobProof = getProofFromHexLeaf(exampleMerkleTree, bobLeaf);

    // fund the contract with tokens
    await xcal.mint(claim.address, 200);
    await usdc.mint(claim.address, 400);
  });

  it("has default values", async function () {
    expect(await claim.merkleRoot()).to.equal(rootHash);
    expect((await xcal.balanceOf(claim.address)).toNumber()).to.equal(200);
    expect((await usdc.balanceOf(claim.address)).toNumber()).to.equal(400);
  });

  it("fails on wrong proof", async function () {
    let invalidClaimError = false;
    try {
      await claim
        .connect(alice)
        .claim(
          [xcal.address, usdc.address],
          [150, 300],
          alice.address,
          bobProof
        );
    } catch (error) {
      invalidClaimError = true;
    }

    expect(invalidClaimError).to.equal(true);
  });

  it("fails on wrong info", async function () {
    let invalidClaimError = false;
    try {
      await claim
        .connect(alice)
        .claim(
          [xcal.address, usdc.address],
          [150, 300],
          bob.address,
          aliceProof
        );
    } catch (error) {
      invalidClaimError = true;
    }

    expect(invalidClaimError).to.equal(true);
  });

  it("users can claim", async function () {
    expect((await xcal.balanceOf(alice.address)).toNumber()).to.equal(0);
    expect((await usdc.balanceOf(alice.address)).toNumber()).to.equal(0);

    await claim
      .connect(alice)
      .claim(
        [xcal.address, usdc.address],
        [150, 300],
        alice.address,
        aliceProof
      );

    expect((await xcal.balanceOf(alice.address)).toNumber()).to.equal(150);
    expect((await usdc.balanceOf(alice.address)).toNumber()).to.equal(300);
    expect((await xcal.balanceOf(claim.address)).toNumber()).to.equal(50);
    expect((await usdc.balanceOf(claim.address)).toNumber()).to.equal(100);

    // claiming again should revert
  });

  it("users cannot claim again", async function () {
    let invalidClaimError = false;
    try {
      await claim
        .connect(alice)
        .claim(
          [xcal.address, usdc.address],
          [150, 300],
          alice.address,
          aliceProof
        );
    } catch (error) {
      invalidClaimError = true;
    }

    expect(invalidClaimError).to.equal(true);
    // claiming again should revert
  });
});
