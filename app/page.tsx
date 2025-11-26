"use client"

import { useEffect, useState } from "react"
import Game2048 from "@/components/Game2048"
import WalletConnect from "@/components/WalletConnect"

export default function Home() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false)
  const [context, setContext] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const isInFrame = window !== window.parent

      // Skip SDK in preview environment
      if (!isInFrame || window.location.hostname.includes("vusercontent.net")) {
        console.log("[v0] Running in standalone mode (preview environment)")
        setIsSDKLoaded(false)
        return
      }

      try {
        const { default: sdk } = await import("@farcaster/frame-sdk")

        setContext(await sdk.context)
        sdk.actions.ready()
        setIsSDKLoaded(true)
        console.log("[v0] Farcaster SDK loaded successfully")
      } catch (error) {
        console.log("[v0] Not in Farcaster environment or SDK failed:", error)
        setIsSDKLoaded(false)
      }
    }
    load()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#faf8ef] p-4">
      <div className="absolute right-4 top-4">
        <WalletConnect />
      </div>

      <div className="mb-6 text-center">
        <h1 className="mb-2 text-5xl font-bold text-[#776e65]">2048</h1>
        <p className="text-sm text-[#776e65]">
          Join the tiles, get to <strong>2048!</strong>
        </p>
        {context && <p className="mt-2 text-xs text-[#8f7a66]">Playing as FID: {context.user?.fid}</p>}
      </div>

      <Game2048 isSDKLoaded={isSDKLoaded} />
    </main>
  )
}
