export const stabilskiTokenSepoliaEthCollateralManagerAddress="0x9e7Ed34003690a7cEe9530b27B8692A23Cab8315";

export const stabilskiTokenArbitrumSepoliaCollateralManagerAddress="0xd99785f20Df5F40B71C372E5390cda92e8228bCf";

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