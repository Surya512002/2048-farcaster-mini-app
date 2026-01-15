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

  const bgClass =
    theme === "dark"
      ? "bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white"
      : "bg-gradient-to-br from-indigo-100 via-purple-100 to-slate-100 text-gray-900"

  return (
    <main className={`flex min-h-screen flex-col items-center justify-center ${bgClass} p-4 transition-colors`}>
      <Onboarding />
      {showPaymentModal && <PaymentModal fid={fid} onPaymentSuccess={handlePaymentSuccess} />}

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed left-4 top-4 p-2 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "light" ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
      </button>

      {!gameStarted ? (
        <>
          {/* Header Navigation */}
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <Button
              onClick={handleSignIn}
              disabled={isLoadingSignIn}
              variant="outline"
              className="min-h-11 px-6 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700"
            >
              {isLoadingSignIn ? "Signing in..." : fid ? `FID: ${fid}` : "Sign In"}
            </Button>
            <WalletConnect />
          </div>

          {/* Main Content */}
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              2048
            </h1>
            <p className="text-base text-indigo-700 dark:text-indigo-300">
              Join the tiles, get to <strong>2048!</strong>
            </p>

            {/* Onboarding Steps */}
            <div className="mt-6 space-y-2 text-sm font-semibold">
              {!fid && <p className="text-indigo-600 dark:text-indigo-400">Step 1: Sign in with Farcaster</p>}
              {fid && !isConnected && (
                <p className="text-indigo-600 dark:text-indigo-400">Step 2: Connect your wallet on Base</p>
              )}
              {fid && isConnected && (
                <p className="text-indigo-600 dark:text-indigo-400">Step 3: Click Play to pay 0.00004 ETH</p>
              )}
            </div>

            {/* Status Indicators */}
            <div className="mt-4 space-y-1 text-xs">
              {sdkLoaded && <p className="text-amber-600 dark:text-amber-400">✓ Connected to Farcaster</p>}
              {fid && <p className="text-amber-600 dark:text-amber-400">✓ Signed in as FID {fid}</p>}
              {isConnected && <p className="text-amber-600 dark:text-amber-400">✓ Wallet connected on Base</p>}
            </div>

            {/* Play Button */}
            {isConnected && !gameStarted && (
              <button
                onClick={handlePlayClick}
                className="mt-6 min-h-12 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-8 py-3 transition-all text-lg w-full sm:w-auto shadow-lg hover:shadow-xl"
              >
                Play Now
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          {/* In-Game Navigation */}
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <Button
              onClick={() => setGameStarted(false)}
              variant="outline"
              className="min-h-11 px-6 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700"
            >
              Exit Game
            </Button>
            <WalletConnect />
          </div>

          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              2048
            </h1>
          </div>

          {/* Game and Leaderboard */}
          <div className="mt-4 flex flex-col items-center gap-8 w-full max-w-2xl">
            <Game2048 key={gameSessionId} sdk={sdkRef.current} fid={fid} onNewGame={handleNewGame} />
            <Leaderboard />
          </div>
        </>
      )}
    </main>
  )
}
