## STABILSKI, Polish Złoty StableCoin

**STABILSKI is a protocol which enables you to deposit a collateral for PLST Tokens. This solution is going cross-chain, which means people will be able to transfer this token between different chains, not only one specific chain.**

![](https://pbs.twimg.com/profile_banners/1937397911677206529/1750747440/1500x500)

The Protocol will consist out of 6 files:

- **CollateralManager.sol**: Manages the tokens allowed to be used as collateral
- **CollateralManager.sol**: Handles deposits, withdrawals, redemptions, minting, and liquidations
- **StabilskiTokenPool.sol**: Manages the process of CCIP Token Handling Burning/Locking or Minting/Unlocking 
- **USDPLNOracle.sol**: Integrates Chainlink Functions and Chainlink Automation to get USD/PLN price
- **StabilskiToken**: ERC20 mintable/burnable stablecoin (PLST)

### How to use ?
Firstly you have to understand how the protocol works, so:

1. You put the collateral. You can get your Stabilski Token on 2 chains **Sepolia Ethereum** or **Sepolia Arbitrum**
Here are the listed contracts' addresses, that you can put as collateral.
```javascript
// For Sepolia Ethereum
const SEPOLIA_ETH_WETH_ADDR="0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"
const SEPOLIA_ETH_WBTC_ADDR="0x29f2d40b0605204364af54ec677bd022da425d03"
const SEPOLIA_ETH_LINK_ADDR="0x779877A7B0D9E8603169DdbD7836e478b4624789"

// For Sepolia Arbitrum 
const ARBITRUM_SEPOLIA_LINK_ADDR="0xb1D4538B4571d411F07960EF2838Ce337FE1E80E"
```
The tokens are to be get by swapping the native tokens on Uniswap in test-mode (only for Sepolia Ethereum) and for getting the LINK tokens (no matter what chain) you can use chainlink faucets.
Links:
Uniswap: https://app.uniswap.org
Chainlink faucets: https://faucets.chain.link

2. You can grab your PLST tokens, with the only condition that you borrow less than your collateral is worth based on minCollateralRatio (on different tokens it differs, on some it's 120% in other 150%)

3. You can enjoy Stabilski Token ☺️

#### How can I loose my collateral ?
Where as the name said it's collateral-based stablecoin, it is a lending protocol. So yes you can loose your collateral, but only if your position will not be fulfilling the healthy factor. Here's the code:
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
