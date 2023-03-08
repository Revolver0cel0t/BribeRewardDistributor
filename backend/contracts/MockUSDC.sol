// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("mockUSDC", "mUSDC") {}

    function mint(address user, uint256 amount) public {
        _mint(user, amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}
