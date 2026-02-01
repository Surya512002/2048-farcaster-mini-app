import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import WagmiProvider from "@/components/providers/WagmiProvider"
import { ThemeProvider } from "@/components/ThemeProvider"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "2048 Mini App - Play on Farcaster & Base",
  description:
    "Experience the ultimate 2048 puzzle game on Farcaster through Base network. Connect your wallet, compete with players, and climb the leaderboard.",
  generator: "v0.app",
  other: {
    "base:app_id": "696282498a6eeb04b568dccb",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "2048 Mini App - Farcaster Gaming",
    description: "Play 2048 on Farcaster and Base. Merge tiles, reach 2048, compete on weekly leaderboards.",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && window.location.hostname.includes('vusercontent.net')) {
                const originalError = console.error;
                console.error = function(...args) {
                  if (args[0] && typeof args[0] === 'string' && args[0].includes('origins don\\'t match')) {
                    return;
                  }
                  originalError.apply(console, args);
                };
              }
            `,
          }}
        />
      </head>
      <body className={`font-sans antialiased`}>
        <ThemeProvider>
          <WagmiProvider>
            {children}
            <Analytics />
          </WagmiProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
