"use client"

import type React from "react"

import { WagmiProvider as WagmiProviderOriginal, createConfig, http } from "wagmi"
import { base } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useMemo, useEffect } from "react"

export default function WagmiProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const config = useMemo(() => {
    const isPreview =
      typeof window !== "undefined" &&
      (window.location.hostname.includes("vusercontent.net") ||
        window.location.hostname.includes("localhost") ||
        window.location.hostname.includes("v0.app"))

    if (isPreview || !mounted) {
      return createConfig({
        chains: [base],
        transports: {
          [base.id]: http(),
        },
        connectors: [],
      })
    }

    try {
      // This dynamic import will only work after deployment with proper domain
      const { farcasterFrame } = require("@farcaster/miniapp-wagmi-connector")

      return createConfig({
        chains: [base],
        transports: {
          [base.id]: http(),
        },
        connectors: [farcasterFrame()],
      })
    } catch (error) {
      console.log("[v0] Farcaster connector not available, using fallback config")
      return createConfig({
        chains: [base],
        transports: {
          [base.id]: http(),
        },
        connectors: [],
      })
    }
  }, [mounted])

  return (
    <WagmiProviderOriginal config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProviderOriginal>
  )
}
