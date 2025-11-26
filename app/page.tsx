"use client"

import { useEffect, useState } from "react"
import Game2048 from "@/components/Game2048"
import WalletConnect from "@/components/WalletConnect"
import Leaderboard from "@/components/Leaderboard"

export default function Home() {
  const [sdkLoaded, setSdkLoaded] = useState(false)

  useEffect(() => {
    async function initSDK() {
      try {
        // Dynamically import SDK to avoid module-level errors
        const { default: sdk } = await import("@farcaster/frame-sdk")

        // Call ready() to dismiss splash screen
        await sdk.actions.ready()
        console.log("[v0] Farcaster SDK initialized successfully")
        setSdkLoaded(true)
      } catch (error) {
        // Silently handle errors in preview/development
        console.log("[v0] Running in standalone mode")
        setSdkLoaded(false)
      }
    }

    initSDK()
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
        {sdkLoaded && <p className="mt-2 text-xs text-green-600">Connected to Farcaster</p>}
      </div>

      <div className="mt-8 flex flex-col items-center gap-6 lg:flex-row lg:items-start">
        <Game2048 />
        <Leaderboard />
      </div>
    </main>
  )
}
