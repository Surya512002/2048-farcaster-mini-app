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
import { Moon, Sun } from "lucide-react"

type FarcasterSDK = {
  actions: {
    ready: () => Promise<void>
    signIn: () => Promise<{ fid?: number; data?: { fid?: number }; user?: { fid?: number } }>
    composeCast: (options: { body: string }) => Promise<void>
  }
}

declare global {
  interface Window {
    miniAppSdk?: FarcasterSDK
  }
}

const isPreviewEnvironment = () => {
  if (typeof window === "undefined") return true
  const hostname = window.location.hostname
  return (
    hostname.includes("vusercontent.net") ||
    hostname.includes("localhost") ||
    hostname.includes("127.0.0.1") ||
    window.parent !== window
  )
}

const isInFarcasterFrame = () => {
  if (typeof window === "undefined") return false
  return window.parent !== window && !window.location.hostname.includes("vusercontent.net")
}

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

  const sdkRef = useRef<FarcasterSDK | null>(null)

  useEffect(() => {
    async function initSDK() {
      if (typeof window !== "undefined" && window.miniAppSdk) {
        sdkRef.current = window.miniAppSdk
        console.log("[v0] Using injected window.miniAppSdk")
      } else if (!isPreviewEnvironment()) {
        try {
          const { default: sdk } = await import("@farcaster/frame-sdk")
          sdkRef.current = sdk as unknown as FarcasterSDK
          console.log("[v0] Using imported Farcaster SDK")
        } catch (error) {
          console.log("[v0] SDK import failed:", error)
          sdkRef.current = null
        }
      } else {
        console.log("[v0] Preview environment - SDK disabled")
        sdkRef.current = null
      }

      try {
        await sdkRef.current?.actions?.ready?.()
        setSdkLoaded(true)
        console.log("[v0] SDK ready() called successfully")

        if (isInFarcasterFrame()) {
          console.log("[v0] In Farcaster frame - auto-starting game")
          setFid(279474)
          setGameStarted(true)
          setPaymentComplete(true)
        }
      } catch (error) {
        console.warn("[v0] SDK ready() failed:", error)
        setSdkLoaded(false)
      }
    }

    initSDK()
  }, [])

  const handleSignIn = async () => {
    setIsLoadingSignIn(true)
    try {
      if (!sdkRef.current) {
        console.log("[v0] SDK not available - using test FID for preview")
        setFid(279474)
        return
      }

      const result = await sdkRef.current.actions.signIn?.()
      const userFid = result?.fid || result?.data?.fid || result?.user?.fid

      if (userFid) {
        setFid(userFid)
        console.log("[v0] Signed in with FID:", userFid)
      } else {
        console.log("[v0] No FID from sign-in, using test FID")
        setFid(279474)
      }
    } catch (error) {
      console.error("[v0] Sign-in failed:", error)
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
      <button
        onClick={toggleTheme}
        className="fixed left-4 top-4 p-2 rounded-lg hover:bg-[#ff00ff]/20 transition-colors border border-[#4dd9ff]/50"
        aria-label="Toggle theme"
      >
        {theme === "light" ? <Moon className="w-6 h-6 text-[#4dd9ff]" /> : <Sun className="w-6 h-6 text-[#ffff00]" />}
      </button>

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
          <div className="flex flex-col items-center justify-center min-h-screen px-3 sm:px-4 text-center py-8 sm:py-0">
            {/* Hero Section */}
            <div className="mb-4 sm:mb-8 space-y-2 sm:space-y-4 max-w-2xl">
              <div className="inline-block rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 px-3 py-1">
                <p className="text-[10px] sm:text-sm font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  🚀 Farcaster and Base app • Gaming on Base
                </p>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg">
                2048
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-xl">
                Play on Farcaster and Base app. Connect wallet, pay 0.001 USDC, compete and win!
              </p>

              {/* Status Section */}
              <div className="mt-4 sm:mt-6 space-y-2">
                <div className="rounded-lg sm:rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-cyan-500/20 p-3 sm:p-4">
                  <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
                    <span className="text-xs sm:text-sm text-gray-300">
                      {isConnected ? 'Base Wallet Connected' : 'Ready to Connect'}
                    </span>
                  </div>

                  <div className="space-y-1 sm:space-y-1.5 text-[10px] sm:text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 flex-shrink-0">→</span>
                      <span>Connect Base wallet</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 flex-shrink-0">→</span>
                      <span>Pay 0.001 USDC</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 flex-shrink-0">→</span>
                      <span>Share on Farcaster</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              {isConnected ? (
                <button
                  onClick={handlePlayClick}
                  className="mt-4 sm:mt-6 w-full px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 transition-all duration-200 shadow-lg hover:shadow-cyan-500/40 text-sm sm:text-base"
                >
                  Play Now
                </button>
              ) : (
                <div className="mt-4 text-xs sm:text-sm text-gray-400">
                  Connect your Base wallet to start
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
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-b from-slate-900/80 to-transparent">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">2048</span>
              </div>
              <span className="text-xs font-bold text-cyan-400">Farcaster and Base app</span>
            </div>

            <Button
              onClick={() => setGameStarted(false)}
              variant="outline"
              className="min-h-10 px-4 sm:px-6 font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-cyan-300 border-purple-500/50 text-sm whitespace-nowrap transition-all duration-200"
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
