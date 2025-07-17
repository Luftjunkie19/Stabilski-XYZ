export const stabilskiTokenSepoliaEthCollateralManagerAddress="0x05a45eb273E87180d2a46a61b0D3cF6e454031a0";

export const stabilskiTokenArbitrumSepoliaCollateralManagerAddress="0x14C557fbba72C41a9239fd69fcF493b569BfB1A7";

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