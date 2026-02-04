# Smart Contract Deployment Guide - Game2048Fee

This guide explains how to deploy the `Game2048Fee` smart contract on Base Network to properly handle game fee collection.

## Overview

The `Game2048Fee` contract:
- Collects 0.001 USDC per game session
- Routes fees directly to your wallet: `0xB4BD7D410543cB27f42c562ab3fF5DC12fBDd42F`
- Records game records and scores on-chain
- Allows fee adjustments (owner only)
- Includes security features (ReentrancyGuard, Ownable)

## Prerequisites

1. **Node.js** and **npm/pnpm** installed
2. **Hardhat** for contract development
3. **Private key** for deployment account (must have funds on Base)
4. **USDC approval** from players to the contract

## Installation

\`\`\`bash
# Install Hardhat and dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv

# Or with pnpm
pnpm add -D hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv
\`\`\`

## Environment Setup

Create a `.env.local` file in your project root:

\`\`\`env
PRIVATE_KEY=your_private_key_here
BASE_RPC_URL=https://mainnet.base.org
\`\`\`

## Deployment Steps

### 1. Create Hardhat Config

Create `hardhat.config.js`:

\`\`\`javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    base: {
      url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      base: process.env.BASESCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
    ],
  },
};
\`\`\`

### 2. Deploy Contract

\`\`\`bash
# Deploy to Base Network
npx hardhat run scripts/deployGame2048Fee.js --network base
\`\`\`

This will:
1. Deploy the contract
2. Set fee recipient to your wallet
3. Output the contract address
4. Save deployment info to `deployments/game2048Fee.json`

### 3. Verify Contract on BaseScan

\`\`\`bash
npx hardhat verify --network base CONTRACT_ADDRESS "0xB4BD7D410543cB27f42c562ab3fF5DC12fBDd42F"
\`\`\`

## Integration with Game

### Update Constants

Update `lib/constants.ts` with your deployed contract:

\`\`\`typescript
export const GAME_FEE_CONTRACT = "0x..." // Your deployed contract address
export const GAME_FEE_AMOUNT_USDC = "0.001"
export const GAME_FEE_AMOUNT_WEI = "1000"
\`\`\`

### Update PaymentModal

Modify `components/PaymentModal.tsx` to use the contract:

\`\`\`typescript
import { useContractWrite } from "wagmi"

// Inside component
const { write: payGameFee } = useContractWrite({
  abi: GAME_2048_FEE_ABI,
  functionName: "payGameFee",
  args: [gameId],
})

// Call on payment button click
const handlePayment = async () => {
  // First approve USDC
  await approveUSDC(GAME_FEE_CONTRACT, GAME_FEE_AMOUNT_WEI)
  // Then pay fee
  await payGameFee()
}
\`\`\`

## Security Features

✅ **ReentrancyGuard** - Prevents reentrancy attacks
✅ **Ownable** - Only owner can update fees and recipient
✅ **USDC Integration** - Uses official USDC token on Base
✅ **Game Records** - Immutable on-chain record of payments

## Contract Functions

### Player Functions

- `payGameFee(gameId)` - Pay 0.001 USDC to start game
- `recordGameWin(gameId, score)` - Record final game score
- `getGameRecord(gameId)` - View game details
- `getPlayerGameCount(player)` - View total games played

### Owner Functions

- `updateGameFee(amount)` - Change fee amount
- `updateFeeRecipient(address)` - Change payment recipient
- `withdrawToken(token, amount)` - Emergency withdraw

## Contract Addresses

| Network | Contract Address | Status |
|---------|-----------------|--------|
| Base    | TBD (Deploy now) | ⏳ Pending |

## Fee Distribution

- **Game Fee**: 0.001 USDC per session
- **Recipient**: 0xB4BD7D410543cB27f42c562ab3fF5DC12fBDd42F (100%)

## Testing

Before mainnet deployment, test on Base Sepolia:

\`\`\`bash
npx hardhat run scripts/deployGame2048Fee.js --network baseSepolia
\`\`\`

## Troubleshooting

**"Insufficient funds"** - Make sure deployment account has ETH for gas on Base
**"USDC transfer failed"** - Players must approve contract first
**"Transaction reverted"** - Check gameId hasn't been used before

## Support

For issues:
1. Check BaseScan for transaction details
2. Verify USDC balance and allowance
3. Confirm fee recipient address is correct
