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
  const [paymentComplete, setPaymentComplete] = useState(false)
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
        alert("Farcaster SDK not available. Please deploy to production.")
        return
      }

      const result = await sdkRef.current.actions.signIn?.()
      const userFid = result?.fid || result?.data?.fid || result?.user?.fid

      if (userFid) {
        setFid(userFid)
        console.log("[v0] Signed in with FID:", userFid)
      } else {
        console.log("[v0] Sign-in result:", result)
        alert("Signed in successfully (check console for details)")
      }
    } catch (error) {
      console.error("[v0] Sign-in failed:", error)
      alert("Sign-in failed. Please try again.")
    }
  }

  const showPaymentModal = fid && isConnected && !paymentComplete

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#faf8ef] p-4">
      {showPaymentModal && <PaymentModal fid={fid} onPaymentSuccess={() => setPaymentComplete(true)} />}

      {!fid || !paymentComplete ? (
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
            {!fid && <p className="mt-4 text-lg font-semibold text-blue-600">Sign in with Farcaster to play</p>}
            {fid && !isConnected && (
              <p className="mt-4 text-lg font-semibold text-blue-600">Connect wallet and pay 0.00004 ETH to play</p>
            )}
            {fid && isConnected && !paymentComplete && (
              <p className="mt-4 text-lg font-semibold text-blue-600">Complete payment to start playing</p>
            )}
            {sdkLoaded && <p className="mt-2 text-xs text-green-600">✓ Connected to Farcaster</p>}
            {fid && <p className="mt-1 text-xs text-blue-600">Signed in as FID {fid}</p>}
          </div>
        </>
      ) : (
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
          </div>

          <div className="mt-8 flex flex-col items-center gap-6 lg:flex-row lg:items-start">
            <Game2048 sdk={sdkRef.current} fid={fid} />
            <Leaderboard />
          </div>
        </>
      )}
    </main>
  )
}
