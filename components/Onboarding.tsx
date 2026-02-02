"use client"

import React from "react"

import { useState } from "react"
import { X, Zap, Trophy, Share2, Gamepad2 } from "lucide-react"

export function Onboarding() {
  const [isOpen, setIsOpen] = useState(true)

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/70 to-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-lg rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 shadow-2xl border border-cyan-500/20">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none" />
        
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-3 top-3 p-1 hover:bg-cyan-500/10 rounded-lg transition-all duration-200 text-cyan-400 hover:text-cyan-300"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative z-10">
          {/* Header */}
          <div className="mb-3 text-center">
            <h2 className="mb-1 text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Welcome to 2048
            </h2>
            <p className="text-xs text-cyan-300 font-medium">Farcaster and Base app</p>
          </div>

          {/* Content Grid */}
          <div className="space-y-2 mb-3">
            {/* How to Play */}
            <div className="group rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-700/50 p-2.5 border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-200">
              <div className="flex gap-2 mb-1">
                <Gamepad2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <h3 className="text-xs font-semibold text-white">How to Play</h3>
              </div>
              <p className="text-xs text-gray-400 ml-5.5">
                Slide tiles. Match numbers to merge!
              </p>
            </div>

            {/* Goal */}
            <div className="group rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-700/50 p-2.5 border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-200">
              <div className="flex gap-2 mb-1">
                <Trophy className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                <h3 className="text-xs font-semibold text-white">Goal</h3>
              </div>
              <p className="text-xs text-gray-400 ml-5.5">
                Reach 2048 and win on leaderboards!
              </p>
            </div>

            {/* Quick Start */}
            <div className="group rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-700/50 p-2.5 border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-200">
              <div className="flex gap-2 mb-1">
                <Zap className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <h3 className="text-xs font-semibold text-white">Quick Start</h3>
              </div>
              <ol className="text-xs text-gray-400 ml-5.5 space-y-0">
                <li>Connect wallet • Pay 0.001 USDC • Play</li>
              </ol>
            </div>

            {/* Features */}
            <div className="group rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-700/50 p-2.5 border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-200">
              <div className="flex gap-2 mb-1">
                <Share2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <h3 className="text-xs font-semibold text-white">Features</h3>
              </div>
              <div className="ml-5.5">
                <ul className="text-xs text-gray-400 space-y-0">
                  <li>• Play on Base • Share on Farcaster</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-bold py-2 px-3 transition-all duration-200 shadow-lg hover:shadow-cyan-500/30 text-xs"
            >
              Play Now
            </button>
          </div>

          {/* Brand Footer */}
          <div className="mt-2 pt-2 border-t border-cyan-500/10 text-center text-[10px] text-gray-500">
            Powered by Base Network
          </div>
        </div>
      </div>
    </div>
  )
}
