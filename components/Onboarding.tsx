"use client"

import { useState } from "react"
import { X, Zap, Trophy, Share2, Gamepad2 } from "lucide-react"

export function Onboarding() {
  const [isOpen, setIsOpen] = useState(true)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/70 to-black/50 backdrop-blur-sm p-4">
      <div className="relative max-w-2xl rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl border border-cyan-500/20">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none" />
        
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 p-2 hover:bg-cyan-500/10 rounded-lg transition-all duration-200 text-cyan-400 hover:text-cyan-300"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative z-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Welcome to 2048
            </h2>
            <p className="text-sm text-cyan-300 font-medium">The Ultimate Farcaster Mini App on Base</p>
          </div>

          {/* Content Grid */}
          <div className="space-y-5 mb-8">
            {/* How to Play */}
            <div className="group rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 p-4 border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-200">
              <div className="flex gap-3 mb-2">
                <Gamepad2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <h3 className="font-semibold text-white">How to Play</h3>
              </div>
              <p className="text-sm text-gray-400 ml-8">
                Slide tiles using arrow keys or swipe. When two tiles with the same number touch, they merge into one powerful tile!
              </p>
            </div>

            {/* Goal */}
            <div className="group rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 p-4 border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-200">
              <div className="flex gap-3 mb-2">
                <Trophy className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <h3 className="font-semibold text-white">Goal & Rewards</h3>
              </div>
              <p className="text-sm text-gray-400 ml-8">
                Reach 2048 and compete for the top spot on the Farcaster Mini App leaderboard. Share your epic wins on Farcaster!
              </p>
            </div>

            {/* Quick Start */}
            <div className="group rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 p-4 border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-200">
              <div className="flex gap-3 mb-2">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <h3 className="font-semibold text-white">Quick Start</h3>
              </div>
              <ol className="text-sm text-gray-400 ml-8 space-y-1">
                <li>1. Connect your wallet on Base network</li>
                <li>2. Pay 0.001 USDC via Base to start a game</li>
                <li>3. Compete on Farcaster leaderboards</li>
              </ol>
            </div>

            {/* Features */}
            <div className="group rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 p-4 border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-200">
              <div className="flex gap-3 mb-2">
                <Share2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <h3 className="font-semibold text-white">Features</h3>
              </div>
              <div className="ml-8">
                <ul className="text-sm text-gray-400 space-y-0.5">
                  <li>• Play on Base network with USDC payments</li>
                  <li>• Share scores directly on Farcaster</li>
                  <li>• Weekly Farcaster Mini App leaderboards</li>
                  <li>• Smooth web3 gaming experience</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-bold py-3 px-4 transition-all duration-200 shadow-lg hover:shadow-cyan-500/30 text-base"
            >
              Let's Play on Farcaster
            </button>
          </div>

          {/* Brand Footer */}
          <div className="mt-6 pt-4 border-t border-cyan-500/10 text-center text-xs text-gray-500">
            2048 Mini App • Powered by Farcaster & Base
          </div>
        </div>
      </div>
    </div>
  )
}
