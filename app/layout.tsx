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
  title: "2048 Game - Reach 2048 and compete on Base",
  description:
    "Play the addictive 2048 puzzle game on Farcaster. Sign in, pay per game, and compete on the weekly leaderboard.",
  generator: "v0.app",
  other: {
    "base:app_id": "696282498a6eeb04b568dccb",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "2048 Game - Play on Farcaster",
    description: "Join the tiles, reach 2048, and compete with other players. Play now on Base network.",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#faf8ef",
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
