"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const getConnectorName = (name: string) => {
    if (name.toLowerCase().includes("metamask")) return "MetaMask"
    if (name.toLowerCase().includes("coinbase")) return "Coinbase Wallet"
    if (name.toLowerCase().includes("farcaster")) return "Farcaster Wallet"
    if (name.toLowerCase().includes("injected")) return "Browser Wallet"
    return name
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-[#bbada0] px-4 py-2">
        <div className="text-xs text-[#eee4da]">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <button onClick={() => disconnect()} className="text-xs font-bold text-white hover:text-[#edc22e]">
          Disconnect
        </button>
      </div>
    )
  }

  if (connectors.length > 1) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="rounded-lg bg-[#8f7a66] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#9f8a76]"
            disabled={isPending}
          >
            {isPending ? "Connecting..." : "Connect Wallet"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#faf8ef] dark:bg-[#2a2a2a] border-[#bbada0] dark:border-[#555]">
          {connectors.map((connector) => (
            <DropdownMenuItem
              key={connector.uid}
              onClick={() => connect({ connector })}
              className="cursor-pointer hover:bg-[#eee4da] dark:hover:bg-[#444] focus:bg-[#eee4da] dark:focus:bg-[#444] text-gray-900 dark:text-white"
            >
              {getConnectorName(connector.name)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <button
      onClick={() => connectors[0] && connect({ connector: connectors[0] })}
      className="rounded-lg bg-[#8f7a66] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#9f8a76] disabled:opacity-50"
      disabled={!connectors[0] || isPending}
    >
      {isPending ? "Connecting..." : connectors[0] ? `Connect ${getConnectorName(connectors[0].name)}` : "No Wallet"}
    </button>
  )
}
