import type React from "react"
import { Providers } from "@/app/providers"

export function LayoutProviders({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}
