"use client"

import Game2048 from "@/components/Game2048"
import WalletConnect from "@/components/WalletConnect"

export default function Home() {
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
        <p className="mt-2 text-xs text-[#8f7a66]">Deploy to enable Farcaster features</p>
      </div>

      <Game2048 />
    </main>
  )
}
