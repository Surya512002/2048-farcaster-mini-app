import { getAddress } from "viem"

// USDC on Base network
// Using getAddress to ensure proper EIP-55 checksum validation
export const USDC_TOKEN_ADDRESS = getAddress("0x833589fcd6edb6e08f4c7c32d4f71b1566da8b16") // Official USDC on Base
export const PAYMENT_AMOUNT_USDC = "0.001" // 0.001 USDC = $0.001
export const PAYMENT_AMOUNT_USDC_WEI = "1000" // 0.001 USDC in wei (6 decimals = 1000)
export const RECIPIENT_WALLET = getAddress("0xb4bd7d410543cb27f42c562ab3ff5dc12fbdd42f") // Recipient wallet
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
