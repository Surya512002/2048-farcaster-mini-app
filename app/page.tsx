"use client"

import { useEffect, useState, useRef } from "react"
import Game2048 from "@/components/Game2048"
import WalletConnect from "@/components/WalletConnect"
import PaymentModal from "@/components/PaymentModal"
import Leaderboard from "@/components/Leaderboard"
import { Button } from "@/components/ui/button"
import { useAccount } from "wagmi"

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
  const { isConnected } = useAccount()
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
    try {
      if (!sdkRef.current) {
        console.log("[v0] SDK not available - using test FID for preview")
        setFid(279474) // Test FID for preview
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
        alert("Signed in successfully (preview mode - using test FID)")
      }
    } catch (error) {
      console.error("[v0] Sign-in failed:", error)
      setFid(279474) // Fallback to test FID
      alert("Using test FID for preview mode")
    }
  }

  const handlePlayClick = () => {
    console.log("[v0] Play clicked - FID:", fid, "Connected:", isConnected)
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }
    console.log("[v0] Opening payment modal...")
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    console.log("[v0] Payment success handler called")
    setPaymentComplete(true)
    setShowPaymentModal(false)
    setGameStarted(true)
    console.log("[v0] Game state set to started")
  }

  const handleNewGame = () => {
    console.log("[v0] New game clicked - requiring payment again")
    setGameStarted(false)
    setPaymentComplete(false)
    setGameSessionId((prev) => prev + 1)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#faf8ef] p-4">
      {showPaymentModal && <PaymentModal fid={fid} onPaymentSuccess={handlePaymentSuccess} />}

      {!gameStarted ? (
        <>
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <Button
              onClick={handleSignIn}
              variant="outline"
              className="border-[#8f7a66] text-[#8f7a66] hover:bg-[#8f7a66] hover:text-white bg-transparent"
            >
              {fid ? `FID: ${fid}` : "Sign In"}
            </Button>
            <WalletConnect />
          </div>

          <div className="mb-6 text-center">
            <img src="/logo-2048.png" alt="2048 Logo" className="mx-auto mb-4 h-24 w-auto" />
            <h1 className="mb-2 text-5xl font-bold text-[#776e65]">2048</h1>
            <p className="text-sm text-[#776e65]">
              Join the tiles, get to <strong>2048!</strong>
            </p>

            {!fid && <p className="mt-4 text-lg font-semibold text-blue-600">Step 1: Sign in with Farcaster</p>}
            {fid && !isConnected && (
              <p className="mt-4 text-lg font-semibold text-blue-600">Step 2: Connect your wallet on Base</p>
            )}
            {fid && isConnected && (
              <p className="mt-4 text-lg font-semibold text-blue-600">Step 3: Click Play to pay {0.00004} ETH</p>
            )}
            {sdkLoaded && <p className="mt-2 text-xs text-green-600">✓ Connected to Farcaster</p>}
            {fid && <p className="mt-1 text-xs text-blue-600">✓ Signed in as FID {fid}</p>}
            {isConnected && <p className="mt-1 text-xs text-green-600">✓ Wallet connected</p>}

            {isConnected && !gameStarted && (
              <button
                onClick={handlePlayClick}
                className="mt-6 rounded-lg bg-[#8f7a66] px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-[#9f8a76]"
              >
                Play Now
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <Button
              onClick={() => setGameStarted(false)}
              variant="outline"
              className="border-[#8f7a66] text-[#8f7a66] hover:bg-[#8f7a66] hover:text-white bg-transparent"
            >
              Exit Game
            </Button>
            <WalletConnect />
          </div>

          <div className="mb-6 text-center">
            <img src="/logo-2048.png" alt="2048 Logo" className="mx-auto mb-2 h-16 w-auto" />
            <h1 className="text-3xl font-bold text-[#776e65]">2048</h1>
          </div>

          <div className="mt-4 flex flex-col items-center gap-8 w-full max-w-2xl">
            <Game2048 sdk={sdkRef.current} fid={fid} onNewGame={handleNewGame} />
            <Leaderboard />
          </div>
        </>
      )}
    </main>
  )
}
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <meta name="base:app_id" content="696282498a6eeb04b568dccb" />
      </Head>
      {/* Your page content */}
    </>
  );
}
