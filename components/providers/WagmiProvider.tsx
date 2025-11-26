"use client"

import type React from "react"

import { WagmiProvider as WagmiProviderOriginal, createConfig, http } from "wagmi"
import { base } from "wagmi/chains"
import { injected, coinbaseWallet } from "wagmi/connectors"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useMemo, useEffect } from "react"

export default function WagmiProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const config = useMemo(() => {
    return createConfig({
      chains: [base],
      transports: {
        [base.id]: http(),
      },
      connectors: [
        injected({
          target: "metaMask",
        }),
        coinbaseWallet({
          appName: "2048 Farcaster Mini App",
          preference: "all",
        }),
        injected(), // Fallback for other injected wallets
      ],
    })
  }, [mounted])

  return (
    <WagmiProviderOriginal config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProviderOriginal>
  )
}
