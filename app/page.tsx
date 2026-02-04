"use client"

import { useEffect, useState, useRef } from "react"
import Game2048 from "@/components/Game2048"
import WalletConnect from "@/components/WalletConnect"
import PaymentModal from "@/components/PaymentModal"
import Leaderboard from "@/components/Leaderboard"
import { Onboarding } from "@/components/Onboarding"
import { Button } from "@/components/ui/button"
import { useAccount } from "wagmi"
import { useTheme } from "@/components/ThemeProvider"
import { useMiniKit } from "@coinbase/onchainkit/minikit"
import { Moon, Sun } from "lucide-react"

const isPreviewEnvironment = () => {
  if (typeof window === "undefined") return true
  const hostname = window.location.hostname
  return (
    hostname.includes("vusercontent.net") ||
    hostname.includes("localhost") ||
    hostname.includes("127.0.0.1")
  )
}

const isInFarcasterFrame = () => {
  if (typeof window === "undefined") return false
  return window.parent !== window && !window.location.hostname.includes("vusercontent.net")
}

const ThemeToggleButton = ({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) => (
  <button
    onClick={toggleTheme}
    className="fixed left-4 top-4 p-2 rounded-lg hover:bg-[#ff00ff]/20 transition-colors border border-[#4dd9ff]/50"
    aria-label="Toggle theme"
  >
    {theme === "light" ? <Moon className="w-6 h-6 text-[#4dd9ff]" /> : <Sun className="w-6 h-6 text-[#ffff00]" />}
  </button>
)

export default function Home() {
  const [sdkLoaded, setSdkLoaded] = useState(false)
  const [fid, setFid] = useState<number | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameSessionId, setGameSessionId] = useState(0)
  const [isLoadingSignIn, setIsLoadingSignIn] = useState(false)
  const { isConnected } = useAccount()
  const { theme, toggleTheme } = useTheme()
  const { setFrameReady, context } = useMiniKit()

  const sdkRef = useRef<any>(null)

  useEffect(() => {
    // Signal frame readiness to MiniKit
    if (setFrameReady) {
      setFrameReady()
      console.log("[v0] MiniKit frame ready signal sent")
    }

    // Extract user FID from MiniKit context
    if (context?.user?.fid) {
      setFid(parseInt(context.user.fid))
      console.log("[v0] Got user FID from MiniKit context:", context.user.fid)
    }

    setSdkLoaded(true)
    console.log("[v0] MiniKit initialized successfully")

    // Auto-start game if in Base app
    if (!isPreviewEnvironment() && context) {
      console.log("[v0] In Base mini app context - ready to play")
      setGameStarted(false) // Let user see onboarding first
    }
  }, [context, setFrameReady])

  const handleSignIn = async () => {
    setIsLoadingSignIn(true)
    try {
      // MiniKit automatically provides authenticated context
      // User is already signed in if FID is available
      if (context?.user?.fid) {
        const userFid = parseInt(context.user.fid)
        setFid(userFid)
        console.log("[v0] Already authenticated with FID:", userFid)
      } else {
        // Fallback for preview environment
        console.log("[v0] No MiniKit context, using test FID")
        setFid(279474)
      }
    } catch (error) {
      console.error("[v0] Sign-in error:", error)
      setFid(279474)
    } finally {
      setIsLoadingSignIn(false)
    }
  }

  const handlePlayClick = () => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    setPaymentComplete(true)
    setShowPaymentModal(false)
    setGameStarted(true)
  }

  const handleNewGame = () => {
    setGameStarted(false)
    setPaymentComplete(false)
    setGameSessionId((prev) => prev + 1)
  }

  const bgClass = "bg-gradient-to-b from-[#0a0e27] via-[#1a0a3e] to-[#0f0820] text-white"

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center ${bgClass} p-4 transition-colors relative overflow-hidden`}
    >
      <div className="fixed inset-0 pointer-events-none">
        {Array(50)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                width: Math.random() * 2 + "px",
                height: Math.random() * 2 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                opacity: Math.random() * 0.5 + 0.3,
                animationDuration: Math.random() * 3 + 1 + "s",
              }}
            />
          ))}
      </div>

      <Onboarding />
      {showPaymentModal && <PaymentModal fid={fid} onPaymentSuccess={handlePaymentSuccess} address={null} />}

      {/* Theme Toggle */}
      <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />

      {!gameStarted ? (
        <>
          {/* Header with Branding */}
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">2048</span>
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-xs font-bold text-white">2048</span>
                <span className="text-[10px] text-cyan-400">Farcaster and Base app</span>
              </div>
            </div>
            <WalletConnect />
          </div>

          {/* Main Content */}
          <div className="flex flex-col items-center justify-center h-screen px-3 sm:px-4 text-center py-6 sm:py-4">
            {/* Hero Section */}
            <div className="mb-2 sm:mb-3 space-y-1.5 sm:space-y-2 max-w-xl">
              <div className="inline-block rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 px-2 py-0.5">
                <p className="text-[8px] sm:text-xs font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  🚀 Farcaster and Base app
                </p>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                2048
              </h1>

              <p className="text-xs sm:text-sm text-gray-300 max-w-lg leading-tight">
                Play, pay 0.001 USDC, compete on Base
              </p>

              {/* Status Section */}
              <div className="mt-2 sm:mt-3">
                <div className="rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-cyan-500/20 p-2 sm:p-2.5">
                  <div className="flex items-center justify-center gap-1.5 mb-1 sm:mb-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
                    <span className="text-[10px] sm:text-xs text-gray-300">
                      {isConnected ? 'Connected' : 'Ready'}
                    </span>
                  </div>

                  <div className="space-y-0.5 text-[8px] sm:text-[10px] text-gray-400">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-cyan-400">→</span>
                      <span>Connect wallet</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-cyan-400">→</span>
                      <span>Pay • Play • Win</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              {isConnected ? (
                <button
                  onClick={handlePlayClick}
                  className="mt-2 sm:mt-3 w-full px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 transition-all duration-200 shadow-lg text-xs sm:text-sm"
                >
                  Play Now
                </button>
              ) : (
                <div className="mt-2 text-[8px] sm:text-xs text-gray-400">
                  Connect wallet to start
                </div>
              )}
            </div>

            {/* Footer Badge */}
            <div className="absolute bottom-4 left-4 right-4 text-center text-xs text-gray-500">
              Farcaster and Base app • Powered by Base Network
            </div>
          </div>
        </>
      ) : (
        <>
          {/* In-Game Header */}
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-b from-slate-900/80 dark:from-slate-950/90 to-transparent">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">2048</span>
              </div>
              <span className="text-xs font-bold text-cyan-400 dark:text-cyan-300">Farcaster and Base app</span>
            </div>

            <Button
              onClick={() => setGameStarted(false)}
              variant="outline"
              className="min-h-10 px-4 sm:px-6 font-semibold bg-purple-500/20 dark:bg-purple-500/30 hover:bg-purple-500/30 dark:hover:bg-purple-500/40 text-cyan-300 dark:text-cyan-200 border-purple-500/50 dark:border-purple-500/40 text-sm whitespace-nowrap transition-all duration-200"
            >
              Exit Game
            </Button>
          </div>

          <div className="pt-12 mb-4 text-center z-10 relative">
            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              2048
            </h1>
            <p className="text-xs text-cyan-400 mt-1">Playing on Farcaster and Base app • Base Network</p>
          </div>

          {/* Game and Leaderboard */}
          <div className="mt-4 flex flex-col items-center gap-8 w-full max-w-2xl z-10 relative">
            <Game2048 key={gameSessionId} sdk={sdkRef.current} fid={fid} onNewGame={handleNewGame} />
            <Leaderboard />
          </div>
        </>
      )}
    </main>
  )
}
