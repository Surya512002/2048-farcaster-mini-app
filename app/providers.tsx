"use client"

import type React from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { config } from "@/lib/wagmi-config"
import { OnchainKitProvider } from "@coinbase/onchainkit"
import { base } from "wagmi/chains"
import { useState } from "react"

export function Providers({ children, apiKey = "" }: { children: React.ReactNode; apiKey?: string }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <OnchainKitProvider
      apiKey={apiKey}
      chain={base}
      config={{
        appearance: {
          mode: "auto",
          theme: "default",
          name: "2048 Mini App",
          logo: "https://2048-farcaster-mini-app.vercel.app/icon.png",
        },
      }}
      miniKit={{ enabled: true }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </OnchainKitProvider>
  )
}

// Default export for backward compatibility
export default Providers
