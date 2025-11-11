deploy-eth:
	forge script script/DeployProductionContracts.s.sol \
		--fork-url $(ETH_SEPOLIA_RPC_URL) \
		--sender 0x7789884c5c88ae84775f266045b96fd6cb5c734b \
		--account primaryWallet \
		--broadcast \
		-vvvvv \
		--verify \
		--etherscan-api-key $(ETHER_SCAN_API_KEY) \
		--via-ir


deploy-arbitrum:
	forge script script/DeployProductionContracts.s.sol \
		--fork-url $(ARB_SEPOLIA_RPC_URL) \
		--sender 0x7789884c5c88ae84775f266045b96fd6cb5c734b \
		--account primaryWallet \
		--broadcast \
		-vvvvv \
		--verify \
		--etherscan-api-key $(ETHER_SCAN_API_KEY) \
		--via-ir


deploy-base:
	forge script script/DeployProductionContracts.s.sol \
		--fork-url $(BASE_SEPOLIA_RPC_URL) \
		--sender 0x7789884c5c88ae84775f266045b96fd6cb5c734b \
		--account primaryWallet \
		--broadcast \
		-vvvvv \
		--verify \
		--etherscan-api-key $(ETHER_SCAN_API_KEY) \
		--via-ir


deploy-eth-oracle:
	forge script script/DeployOracle.s.sol \
		--fork-url $(ETH_SEPOLIA_RPC_URL) \
		--sender 0x7789884c5c88ae84775f266045b96fd6cb5c734b \
		--account primaryWallet \
		--broadcast \
		-vvvvv \
		--verify \
		--etherscan-api-key $(ETHER_SCAN_API_KEY) \
		--via-ir

deploy-arb-oracle:
	forge script script/DeployOracle.s.sol \
		--fork-url $(ARB_SEPOLIA_RPC_URL) \
		--sender 0x7789884c5c88ae84775f266045b96fd6cb5c734b \
		--account primaryWallet \
		--broadcast \
		-vvvvv \
		--verify \
		--etherscan-api-key $(ETHER_SCAN_API_KEY) \
		--via-ir

deploy-base-oracle:
	forge script script/DeployOracle.s.sol \
		--fork-url $(BASE_SEPOLIA_RPC_URL) \
		--sender 0x7789884c5c88ae84775f266045b96fd6cb5c734b \
		--account primaryWallet \
		--broadcast \
		-vvvvv \
		--verify \
		--etherscan-api-key $(ETHER_SCAN_API_KEY) \
		--via-ir


deploy-eth-pool:
	forge script script/ccip-contracts/DeployStabilskiTokenPoolProduction.s.sol \
		--fork-url $(ETH_SEPOLIA_RPC_URL) \
		--sender 0x7789884c5c88ae84775f266045b96fd6cb5c734b \
		--account primaryWallet \
		--broadcast \
		-vvvvv \
		--verify \
		--etherscan-api-key $(ETHER_SCAN_API_KEY) \
		--via-ir

deploy-arb-pool:
	forge script script/ccip-contracts/DeployStabilskiTokenPoolProduction.s.sol \
		--fork-url $(ARB_SEPOLIA_RPC_URL) \
		--sender 0x7789884c5c88ae84775f266045b96fd6cb5c734b \
		--account primaryWallet \
		--broadcast \
		-vvvvv \
		--verify \
		--etherscan-api-key $(ETHER_SCAN_API_KEY) \
		--via-ir

deploy-base-pool:
	forge script script/ccip-contracts/DeployStabilskiTokenPoolProduction.s.sol \
		--fork-url $(BASE_SEPOLIA_RPC_URL) \
		--sender 0x7789884c5c88ae84775f266045b96fd6cb5c734b \
		--account primaryWallet \
		--broadcast \
		-vvvvv \
		--verify \
		--etherscan-api-key $(ETHER_SCAN_API_KEY) \
		--via-ir

applychains-eth:
	forge script script/ccip-contracts/ApplyChain.s.sol \
		--fork-url $(ETH_SEPOLIA_RPC_URL) \
		--sender 0x7789884c5c88ae84775f266045b96fd6cb5c734b \
		--account primaryWallet \
		--broadcast \
		-vvvvv \
		--verify \
		--etherscan-api-key $(ETHER_SCAN_API_KEY) \
		--via-ir

applychains-base:
	forge script script/ccip-contracts/ApplyChain.s.sol \
		--fork-url $(BASE_SEPOLIA_RPC_URL) \
		--sender 0x7789884c5c88ae84775f266045b96fd6cb5c734b \
		--account primaryWallet \
		--broadcast \
		-vvvvv \
		--verify \
		--etherscan-api-key $(ETHER_SCAN_API_KEY) \
		--via-ir

applychains-arb:
	forge script script/ccip-contracts/ApplyChain.s.sol \
		--fork-url $(ARB_SEPOLIA_RPC_URL) \
		--sender 0x7789884c5c88ae84775f266045b96fd6cb5c734b \
		--account primaryWallet \
		--broadcast \
		-vvvvv \
		--verify \
		--etherscan-api-key $(ETHER_SCAN_API_KEY) \
		--via-ir