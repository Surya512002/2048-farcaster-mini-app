"use client"

import type React from "react"

import { WagmiProvider as WagmiProviderOriginal, createConfig, http } from "wagmi"
import { base } from "wagmi/chains"
import { injected } from "wagmi/connectors"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useMemo, useEffect } from "react"

export default function WagmiProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const config = useMemo(() => {
    const connectorsList = [
      injected({
        target: "metaMask",
      }),
      injected(), // Works with any injected wallet (MetaMask, Coinbase Wallet, Rabby, etc.)
    ]

    // Only add Farcaster connector when mounted (client-side) and not in preview
    if (mounted && typeof window !== "undefined" && !window.location.hostname.includes("vusercontent.net")) {
      try {
        // Dynamic import to avoid SSR issues
        const { farcasterFrame } = require("@farcaster/miniapp-wagmi-connector")
        connectorsList.push(farcasterFrame())
      } catch (error) {
        console.log("[v0] Farcaster connector not available in this environment")
      }
    }

    return createConfig({
      chains: [base],
      transports: {
        [base.id]: http(),
      },
      connectors: connectorsList,
    })
  }, [mounted])

  return (
    <WagmiProviderOriginal config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProviderOriginal>
  )
}
