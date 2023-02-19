# Xcaliswap

## Info

### Altered contracts

#### Overview

##### Info per contract

- [Bribe](contracts/periphery/Bribe.sol)
  lines of code: 351
  library dependencies: 1
  interfaces: 3
  structs: 3

- [Voter](contracts/periphery/Voter.sol)
  lines of scope: 298
  library dependencies: 1
  interfaces: 9
  structs: 0

- [Gauges](contracts/periphery/Gauge.sol)
  lines of code: 442
  library dependencies: 1
  interfaces: 6
  structs: 3

- [Pair](contracts/core/SwapPair.sol)
  Lines of code: 427
  library dependencies: 1
  interfaces: 3
  structs: 0

- [Factory](contracts/core/SwapFactory.sol)
  Lines of code: 59
  library dependencies: 0
  interfaces: 0
  structs: 0

- [Minter](contracts/periphery/Minter.sol)
  Lines of code: 95
  library dependencies: 1
  interfaces: 4
  structs: 0

- [Multiswap](contracts/periphery/Multiswap.sol)
  Lines of code: 76
  library dependencies: 0
  interfaces: 0
  structs: 0

##### Total

total lines of code: 1748  
total library dependencies: 1 ([math](contracts/core/libraries/Math.sol))  
total interfaces: 25  
total structs: 6

#### Questions

- Does most of your code generally use composition or inheritance?

Our codebase uses a majority of composition

- How many external calls?

Our protocol does not call any external contracts

## Deployment

Set environment variables in a .env file:

```bash
PRIVATE_KEY=<ur private key>
ALCHEMY_API_KEY=<your alchemy api key>
```

In root of repo:

```bash
$ yarn
$ npx hardhat run ./scripts/deploy.ts [--network <network>]
```

Deployed addresses will be in `./scipts/config/<network>.json`

## Tests

The test suite uses the [foundry](https://book.getfoundry.sh/) framework.

to install foundry, run:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

to run the test files, first install the dependencies:

```bash
npm install
forge install foundry-rs/forge-std --no-commit
forge install transmissions11/solmate --no-commit
```

then run:

```bash
# forge test --force -f <rpc-url> --match-contract <contract-name>
forge test --force -f https://arb1.arbitrum.io/rpc
```
