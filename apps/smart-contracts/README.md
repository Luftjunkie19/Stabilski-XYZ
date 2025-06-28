## STABILSKI, Polish Złoty StableCoin

**STABILSKI is a protocol which enables you to deposit a collateral for PLST Tokens. This solution will be (Before work-started time 27.06.2025) cross-chain which means people will be able to transfer this token between different chains, not only one specific chain.**

![](https://pbs.twimg.com/profile_banners/1937397911677206529/1750747440/1500x500)

The Protocol will consist out of 6 files:

- **AccessControlManager.sol**: Role-based access (admin, oracle, liquidator, bridge)
- **AutomationManager.sol**: Chainlink Automation to trigger updates and liquidation checks
- **CollateralManager.sol**: Handles deposits, redemptions, minting, and liquidations
- **CrossChainBridge.sol**: Mock bridge for burn/mint mechanics between chains
- **OracleAdapter.sol**: Integrates Chainlink Functions to get USD/PLN price
- **StabilskiToken**: ERC20 mintable/burnable stablecoin (PLST)
