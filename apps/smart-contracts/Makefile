deploy-sepolia:
	forge script script/DeployProductionContracts.s.sol \
		--fork-url $(ETH_SEPOLIA_RPC_URL) \
		--sender 0x9F724ab3520f6dD4Be3A093FdA9Ad8F45997291F \
		--account primaryWallet \
		--broadcast \
		-vvvvv \
		--verify \
		--etherscan-api-key $(ETHER_SCAN_API_KEY) \
		--via-ir


deploy-arbitrum:
	forge script script/DeployProductionContracts.s.sol \
		--fork-url $(ARB_SEPOLIA_RPC_URL) \
		--sender 0x9F724ab3520f6dD4Be3A093FdA9Ad8F45997291F \
		--account primaryWallet \
		--broadcast \
		-vvvvv \
		--verify \
		--etherscan-api-key $(ETHER_SCAN_API_KEY) \
		--via-ir
