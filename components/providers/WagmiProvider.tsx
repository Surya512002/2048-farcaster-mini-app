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
        window.location.hostname.includes("127.0.0.1") ||
        window.parent !== window)

    return createConfig({
      chains: [base],
      transports: {
        [base.id]: http(),
      },
      connectors: [], // Empty connectors array - will be added after deployment
    })
  }, [mounted])

  return (
    <WagmiProviderOriginal config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProviderOriginal>
  )
}
