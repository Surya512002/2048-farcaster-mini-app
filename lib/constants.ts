// USDC on Base network
export const USDC_TOKEN_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b1566dA8b16" // Official USDC on Base
export const PAYMENT_AMOUNT_USDC = "1" // 1 USDC = $1
export const PAYMENT_AMOUNT_USDC_WEI = "1000000" // 1 USDC in wei (6 decimals)
export const RECIPIENT_WALLET = "0xb4bd7d410543cb27f42c562ab3ff5dc12fbdd42f"
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
