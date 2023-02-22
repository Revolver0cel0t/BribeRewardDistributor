// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MerkleClaimMultipleERC20 is Ownable {
    bytes32 public immutable merkleRoot;

    mapping(address => bool) public hasClaimed;

    event Claim(address indexed to, address[] tokens, uint256[] amounts);

    error AlreadyClaimed(); // Already claimed rewards for token
    error InvalidProof(); // Proof provided is not in merkle tree
    error ArrayLength(); //length of arrays must be equal

    constructor(bytes32 _merkleRoot) {
        merkleRoot = _merkleRoot;
    }

    function emergencyWithdraw(
        address[] memory _tokens
    ) external payable onlyOwner {
        for (uint256 index = 0; index < _tokens.length; index++) {
            IERC20 token = IERC20(_tokens[index]);
            token.transfer(owner(), token.balanceOf(address(this)));
        }
    }

    function claim(
        address[] memory tokens,
        uint256[] memory amounts,
        address to,
        bytes32[] calldata proof
    ) external {
        if (hasClaimed[to]) revert AlreadyClaimed();

        if (tokens.length != amounts.length) revert ArrayLength();

        bytes32 leaf = keccak256(
            bytes.concat(keccak256(abi.encode(tokens, amounts, to)))
        );

        if (!MerkleProof.verify(proof, merkleRoot, leaf)) revert InvalidProof();

        hasClaimed[to] = true;

        _sendTokensToOwner(to, tokens, amounts);

        emit Claim(to, tokens, amounts);
    }

    function _sendTokensToOwner(
        address _to,
        address[] memory _tokens,
        uint256[] memory _amounts
    ) internal {
        for (uint256 index = 0; index < _amounts.length; index++) {
            IERC20(_tokens[index]).transfer(_to, _amounts[index]);
        }
    }
}

//USDC - 0x3e1D04dA1a47c13a3A09E7932E41Cc11c9DeB70d
//DAI - 0x5aE6BB65A960AE8c95a5AC4b80061c2fF2717e9E
//WETH - 0x9A25996A76617F29c0d7C5223D42774373Ea40B3
