import { createConfig, http } from "wagmi"
import { base } from "wagmi/chains"
import { injected } from "wagmi/connectors"

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    injected({
      target: "metaMask",
    }),
    injected(), // Works with any injected wallet (MetaMask, Coinbase Wallet, Rabby, etc.)
  ],
})
