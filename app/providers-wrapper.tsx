import { Providers } from "@/app/providers"
import type React from "react"

// This is a Server Component - only here do we read the environment variable
export function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  // API key is read on the server - the NEXT_PUBLIC_ prefix is required by Next.js
  // but this server component ensures it's not exposed unnecessarily in client bundles
  const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || ""

  return <Providers apiKey={apiKey}>{children}</Providers>
}
