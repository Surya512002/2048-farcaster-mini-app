"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { useState, useEffect } from "react"

export default function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [isPreview, setIsPreview] = useState(true)

  useEffect(() => {
    const preview =
      typeof window !== "undefined" &&
      (window.location.hostname.includes("vusercontent.net") || window.location.hostname.includes("localhost"))
    setIsPreview(preview)
  }, [])

  if (isPreview) {
    return (
      <button
        disabled
        className="rounded-lg bg-[#bbada0] px-4 py-2 text-sm font-bold text-white opacity-50 cursor-not-allowed"
        title="Wallet connection available after deployment"
      >
        Connect Wallet (Deploy)
      </button>
    )
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-[#bbada0] px-4 py-2">
        <div className="text-xs text-[#eee4da]">
          Base: {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <button onClick={() => disconnect()} className="text-xs font-bold text-white hover:text-[#edc22e]">
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => connectors[0] && connect({ connector: connectors[0] })}
      className="rounded-lg bg-[#8f7a66] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#9f8a76]"
      disabled={!connectors[0]}
    >
      Connect Base Wallet
    </button>
  )
}
