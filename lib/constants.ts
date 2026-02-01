// USDC on Base network
export const USDC_TOKEN_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b1566dA8b16" // Official USDC on Base with proper checksum
export const PAYMENT_AMOUNT_USDC = "0.001" // 0.001 USDC = $0.001
export const PAYMENT_AMOUNT_USDC_WEI = "1000" // 0.001 USDC in wei (6 decimals = 1000)
export const RECIPIENT_WALLET = "0xB4BD7D410543cB27f42c562ab3fF5DC12fBDd42F" // Recipient with proper checksum
export const BASE_CHAIN_ID = 8453

// USDC Contract ABI (minimal - only needed functions)
export const USDC_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const
