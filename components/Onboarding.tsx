"use client"

import { useState } from "react"
import { X } from "lucide-react"

export function Onboarding() {
  const [isOpen, setIsOpen] = useState(true)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-w-md rounded-2xl bg-white p-8 dark:bg-slate-900 shadow-2xl">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Welcome to 2048!</h2>

        <div className="space-y-4 mb-6 text-gray-700 dark:text-gray-300">
          <div>
            <h3 className="font-semibold mb-2">How to Play</h3>
            <p className="text-sm">
              Slide tiles using arrow keys or swipe gestures. When two tiles with the same number touch, they merge into
              one!
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Goal</h3>
            <p className="text-sm">Reach the 2048 tile and continue playing to achieve the highest score possible.</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Getting Started</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Sign in with your Farcaster account</li>
              <li>Connect your wallet on Base network</li>
              <li>Pay 0.00004 ETH per game</li>
              <li>Start playing and compete on the leaderboard</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Features</h3>
            <ul className="text-sm space-y-1">
              <li>• Weekly leaderboard with real players</li>
              <li>• Share scores on Farcaster</li>
              <li>• Light and dark mode support</li>
              <li>• Play on Base network</li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 transition-colors text-lg"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  )
}
