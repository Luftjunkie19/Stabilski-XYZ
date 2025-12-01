## STABILSKI, Polish Złoty StableCoin

**STABILSKI-XYZ** is a protocol which enables you to deposit a collateral in **WETH**, **LINK** or even **WBTC** for PLST Tokens, which represent Polish Currency (Polski Złoty). 

This solution is cross-chain, which means people are able to transfer this token between different chains, not only one specific chain.

![](https://pbs.twimg.com/profile_banners/1937397911677206529/1750747440/1500x500)

### Chains Supported
- Ethereum Sepolia
- Arbitrum Sepolia
- Base Sepolia


The Protocol will consist out of 6 files:

- **CollateralManager.sol**: Manages CRUD opertations of the tokens allowed to be used as collateral, returns price of the collateral token and other info like `minCollateralRatio` or if the collateral-option is active or not to be used.

- **VaultManager.sol**: Handles deposits, withdrawals, redemptions, minting, and liquidations. Prevents exploitation by checking e.g. `healthFactor` or `isHealthyAfterWithrawal` or `isLiquidatable`

- **USDPLNOracle.sol**: Integrates Chainlink Functions and Chainlink Automation 
to get USD/PLN price

- **StabilskiToken**: ERC20 mintable/burnable stablecoin (PLST), Implements the functionality of minting, burning the tokens, but only to allowed 

- **CcipInformationRetriever.sol**: Manages retrieveal of costs and validation of successful cross-chain transfer. Allows to transfer the tokens to your balance on other chain.

### How to use ?
Firstly you have to understand how the protocol works, so:

1. You deposit the collateral. You can get your Stabilski Token on 3 chains **Sepolia Ethereum**, **Sepolia Arbitrum**, **Sepolia Base**
Here are the listed contracts' addresses, that you can put as collateral.
```javascript
// Ethereum Sepolia
export const SEPOLIA_ETH_WETH_ADDR="0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"
export const SEPOLIA_ETH_WBTC_ADDR="0x29f2D40B0605204364af54EC677bD022dA425d03"
export const SEPOLIA_ETH_LINK_ADDR="0x779877A7B0D9E8603169DdbD7836e478b4624789"

// Arbitrum Sepolia
export const ARBITRUM_SEPOLIA_LINK_ADDR="0xb1D4538B4571d411F07960EF2838Ce337FE1E80E"

// Base Sepolia
export const BASE_SEPOLIA_LINK_ADDR="0xE4aB69C077896252FAFBD49EFD26B5D171A32410";
export const BASE_SEPOLIA_WETH_ADDR="0x4200000000000000000000000000000000000006";
```

The tokens are to be get by swapping the native tokens on Uniswap in test-mode (only for Sepolia Ethereum) and for getting the LINK tokens (no matter what chain) you can use chainlink faucets.
Links:
Uniswap: https://app.uniswap.org
Chainlink faucets: https://faucets.chain.link

2. You can get your PLST tokens, with the only condition that you borrow less than your collateral is worth based on `minCollateralRatio` (for now for all tokens `minCollateralRatio` is **140%** )

3. You can enjoy Stabilski Token ☺️

#### How can I loose my collateral ?

Whereas the name said it's collateral-based stablecoin, it is a lending protocol. So yes you can loose your collateral, but only if your position will not be fulfilling the healthy factor. Here's the code:

```solidity
function isLiquidatable(address vaultOwner, address token) public view returns (bool) {
    uint256 healthFactor = getVaultHealthFactor(vaultOwner, token);
    (, uint256 minCollateralRatio,,,) = collateralManager.getCollateralInfo(token);
    
    // Apply a 15% liquidation threshold buffer so the buffer is 85%.
    uint256 liquidationThreshold = (minCollateralRatio * liquidationBuffer) / 100;

    return healthFactor < liquidationThreshold;
}
```

So you have to be sure that your vault is always overcollaterized, otherwise you can get liquidate by others.

It doesn't mean that as you borrow max amount of PLST and your collaterization ratio will be suddenly e.g. `139%`, that you're likely to be liquidated, no.

As the function shows, there is `15%` buffer, so given your position is collatrized `140%`, then `140 * 0.15=21`, so `140-21=119`. The liquidation process will be enabled if your position will be collatrized on min `119%`
