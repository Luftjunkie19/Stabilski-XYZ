export const stabilskiTokenSepoliaEthCollateralManagerAddress="0x630c3207b4E18660e7e1985Da051fF6B077BD307";

export const stabilskiTokenArbitrumSepoliaCollateralManagerAddress="0x64A2c90d42bb8B65F7671A61952C02364673791c";

export const stabilskiTokenCollateralManagerAbi=[
{"type":"constructor","inputs":[{"name":"_collateralTokens","type":"address[]","internalType":"address[]"},{"name":"_priceFeeds","type":"address[]","internalType":"address[]"},{"name":"_minCollateralRatios","type":"uint256[]","internalType":"uint256[]"}],"stateMutability":"nonpayable"},
{"type":"function","name":"addCollateralType","inputs":[{"name":"collateralToken","type":"address","internalType":"address"},{"name":"priceFeed","type":"address","internalType":"address"},{"name":"minCollateralRatio","type":"uint256","internalType":"uint256"},{"name":"liquidationBonus","type":"uint256","internalType":"uint256"},{"name":"punishment","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
{"type":"function","name":"collateralTokens","inputs":[{"name":"","type":"uint256","internalType":"uint256"},{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
{"type":"function","name":"collateralTypes","inputs":[{"name":"","type":"address","internalType":"address"}],"outputs":[{"name":"priceFeed","type":"address","internalType":"address"},{"name":"minCollateralRatio","type":"uint256","internalType":"uint256"},{"name":"isActive","type":"bool","internalType":"bool"},{"name":"liquidationBonus","type":"uint256","internalType":"uint256"},{"name":"punishment","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
{"type":"function","name":"getCollateralInfo","inputs":[{"name":"token","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"address","internalType":"address"},{"name":"","type":"uint256","internalType":"uint256"},{"name":"","type":"bool","internalType":"bool"},{"name":"","type":"uint256","internalType":"uint256"},{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
{"type":"function","name":"getCollateralTokens","inputs":[],"outputs":[{"name":"","type":"address[]","internalType":"address[]"}],"stateMutability":"view"},
{"type":"function","name":"getTokenPrice","inputs":[{"name":"token","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
{"type":"function","name":"toggleCollateral","inputs":[{"name":"token","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},
{"type":"function","name":"updateCollateral","inputs":[{"name":"collateralToken","type":"address","internalType":"address"},{"name":"priceFeed","type":"address","internalType":"address"},{"name":"minCollateralRatio","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
{"type":"error","name":"CollateralAlreadyExists","inputs":[]},
{"type":"error","name":"InvalidCollateralToken","inputs":[]},
{"type":"error","name":"InvalidMinCollateralRatio","inputs":[]},
{"type":"error","name":"InvalidPriceFeed","inputs":[]},
{"type":"error","name":"NotAllowedChain","inputs":[]},
{"type":"error","name":"TokenPriceNotAvailable","inputs":[]}]