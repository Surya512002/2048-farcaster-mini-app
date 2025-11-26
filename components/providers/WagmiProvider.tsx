"use client"

import type React from "react"

import { WagmiProvider as WagmiProviderOriginal, createConfig, http } from "wagmi"
import { base } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useMemo } from "react"

export default function WagmiProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  const config = useMemo(() => {
    const isPreview =
      typeof window !== "undefined" &&
      (window.location.hostname.includes("vusercontent.net") || window.location.hostname.includes("localhost"))

    // In preview mode, create config without connectors
    if (isPreview) {
      return createConfig({
        chains: [base],
        transports: {
          [base.id]: http(),
        },
        connectors: [], // No connectors in preview to avoid SDK errors
      })
    }

    // In production, dynamically import and use Farcaster connector
    // This will be handled after deployment
    return createConfig({
      chains: [base],
      transports: {
        [base.id]: http(),
      },
      connectors: [],
    })
  }, [])

  return (
    <WagmiProviderOriginal config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProviderOriginal>
  )
}
