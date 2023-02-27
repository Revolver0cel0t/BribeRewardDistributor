// npx hardhat test test/merkle_test.js

const { expect } = require("chai");
const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const keccak256 = require("keccak256");

describe("Merkle claim", async () => {

    let owner, alice, bob;
    let claim, xcal, usdc;
    let rootHash;
    let tokens;
    let aliceProof, bobProof;

    const aliceAmounts = [150, 300];
    const bobAmounts = [50, 100];

  before(async () => {

    [owner, alice, bob] = await ethers.getSigners();

    const MerkleClaim = await ethers.getContractFactory("MerkleClaimMultipleERC20");

    const MockXCAL = await ethers.getContractFactory("MockXCAL");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");

    xcal = await MockXCAL.deploy();
    console.log();
    console.log("MockXCAL deployed");

    usdc = await MockUSDC.deploy();
    console.log("MockUSDC deployed");

    tokens = [xcal.address, usdc.address];

    const leaves = [
      [tokens, aliceAmounts, alice.address],
      [tokens, bobAmounts, bob.address]
    ];

    const tree = StandardMerkleTree.of(leaves, [
      "address[]",
      "uint256[]",
      "address",
    ]);
  
    rootHash = tree.root;

    claim = await MerkleClaim.deploy(tree.root);
    console.log("Merkle claim deployed");
    console.log();


    // getting proofs

    for (const [i, v] of tree.entries()) {
      if (v[2] === alice.address) {
        aliceProof = tree.getProof(i);
        //console.log('Value:', v);
        //console.log('Proof:', aliceProof);
      }
    }

    for (const [i, v] of tree.entries()) {
      if (v[2] === bob.address) {
        bobProof = tree.getProof(i);
        //console.log('Value:', v);
        //console.log('Proof:', bobProof);
      }
    }


    // fund the contract with tokens
    await xcal.mint(claim.address, 200);
    await usdc.mint(claim.address, 400);

  });


  it("has default values", async function () {

    expect(await claim.merkleRoot()).to.equal(rootHash);

    expect(await xcal.balanceOf(claim.address)).to.equal(200);
    expect(await usdc.balanceOf(claim.address)).to.equal(400);

  });


  it("users can claim", async function () {

    expect(await xcal.balanceOf(alice.address)).to.equal(0);
    expect(await usdc.balanceOf(alice.address)).to.equal(0);

    await claim.connect(alice).claim(tokens, aliceAmounts, alice.address, aliceProof);

    expect(await xcal.balanceOf(alice.address)).to.equal(150);
    expect(await usdc.balanceOf(alice.address)).to.equal(300);
    expect(await xcal.balanceOf(claim.address)).to.equal(50);
    expect(await usdc.balanceOf(claim.address)).to.equal(100);

    // claiming again should revert
    await expect(
      claim.connect(alice).claim(tokens, aliceAmounts, alice.address, aliceProof)
    ).to.be.revertedWithCustomError(claim, "AlreadyClaimed");
    
    // invalid proof
    await expect(
      claim.connect(bob).claim(tokens, bobAmounts, bob.address, aliceProof)
    ).to.be.revertedWithCustomError(claim, "InvalidProof");

    // array length differs
    await expect(
      claim.connect(bob).claim(tokens, [10, 20, 30], bob.address, bobProof)
    ).to.be.revertedWithCustomError(claim, "ArrayLength");

    await claim.connect(alice).claim(tokens, bobAmounts, bob.address, bobProof); // anyone with the proof etc can trigger the claim
    expect(await xcal.balanceOf(bob.address)).to.equal(50);
    expect(await usdc.balanceOf(bob.address)).to.equal(100);
    expect(await xcal.balanceOf(claim.address)).to.equal(0);
    expect(await usdc.balanceOf(claim.address)).to.equal(0);

  });

  it("owner can emergency withdraw", async function () {

    // fund the contract with tokens
    await xcal.mint(claim.address, 500);
    await usdc.mint(claim.address, 500);

    expect(await xcal.balanceOf(claim.address)).to.equal(500);
    expect(await usdc.balanceOf(claim.address)).to.equal(500);
    expect(await xcal.balanceOf(owner.address)).to.equal(0);
    expect(await usdc.balanceOf(owner.address)).to.equal(0);

    // only owner can call
    await expect(
      claim.connect(bob).emergencyWithdraw(tokens)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await claim.emergencyWithdraw(tokens);

    expect(await xcal.balanceOf(claim.address)).to.equal(0);
    expect(await usdc.balanceOf(claim.address)).to.equal(0);
    expect(await xcal.balanceOf(owner.address)).to.equal(500);
    expect(await usdc.balanceOf(owner.address)).to.equal(500);

  });
  
});