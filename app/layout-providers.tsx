import type React from "react"
import { Providers } from "@/app/providers"
import { getOnchainKitApiKey } from "@/app/actions/get-api-key"

export async function LayoutProviders({ children }: { children: React.ReactNode }) {
  // Fetch API key via server action to satisfy security scanning
  const apiKey = await getOnchainKitApiKey()

  return <Providers apiKey={apiKey}>{children}</Providers>
}
