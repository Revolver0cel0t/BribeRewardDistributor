// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockXCAL is ERC20 {
    constructor() ERC20("mockXCAL", "mUXCAL") {}

    function mint(address user, uint256 amount) public {
        _mint(user, amount);
    }
}
