"use client"

import type React from "react"

import { WagmiProvider as WagmiProviderOriginal, createConfig, http } from "wagmi"
import { base } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { farcasterFrame } from "@farcaster/miniapp-wagmi-connector"
import { useState } from "react"

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [farcasterFrame()],
})

export default function WagmiProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProviderOriginal config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProviderOriginal>
  )
}
