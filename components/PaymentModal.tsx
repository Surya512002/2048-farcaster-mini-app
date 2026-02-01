"use client"

import { useState, useEffect } from "react"
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi"
import { encodeFunctionData } from "viem"
import { base } from "wagmi/chains"
import { Button } from "@/components/ui/button"
import { USDC_TOKEN_ADDRESS, PAYMENT_AMOUNT_USDC, PAYMENT_AMOUNT_USDC_WEI, RECIPIENT_WALLET, USDC_ABI } from "@/lib/constants"

interface PaymentModalProps {
  onPaymentSuccess: () => void
  fid: number | null
}

export default function PaymentModal({ onPaymentSuccess, fid }: PaymentModalProps) {
  const { isConnected, address } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { sendTransaction, isPending, data: txHash, isError, error, reset } = useSendTransaction()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash, chainId: base.id })
  const [localError, setLocalError] = useState<string>("")
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false)

  useEffect(() => {
    if (isSuccess && txHash) {
      console.log("[v0] Payment successful, transaction hash:", txHash)
      setLocalError("")
      setWaitingForConfirmation(false)
      setTimeout(() => {
        console.log("[v0] Calling onPaymentSuccess callback")
        onPaymentSuccess()
      }, 1000)
    }
  }, [isSuccess, txHash, onPaymentSuccess])

  useEffect(() => {
    if (isPending) {
      setWaitingForConfirmation(true)
    }
  }, [isPending])

  const handlePayment = async () => {
    console.log("[v0] Payment button clicked, chainId:", chainId, "isConnected:", isConnected)

    if (!isConnected) {
      setLocalError("Please connect your wallet first")
      return
    }

    if (chainId !== base.id) {
      setLocalError(`Please switch to Base network. Current chain: ${chainId}`)
      try {
        await switchChain({ chainId: base.id })
      } catch (err) {
        setLocalError("Failed to switch to Base network. Please switch manually in your wallet.")
        return
      }
      return
    }

    try {
      setLocalError("")
      console.log("[v0] Sending USDC transfer to:", RECIPIENT_WALLET, "Amount:", PAYMENT_AMOUNT_USDC, "USDC")
      console.log("[v0] Transaction details - USDC Contract:", USDC_TOKEN_ADDRESS, "Recipient:", RECIPIENT_WALLET)

      // Encode the transfer function call
      const data = encodeFunctionData({
        abi: USDC_ABI,
        functionName: "transfer",
        args: [RECIPIENT_WALLET as `0x${string}`, BigInt(PAYMENT_AMOUNT_USDC_WEI)],
      })

      console.log("[v0] Encoded transaction data:", data)

      sendTransaction({
        to: USDC_TOKEN_ADDRESS as `0x${string}`,
        data,
        chainId: base.id,
        account: address,
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Payment failed"
      console.log("[v0] Payment error:", errorMsg)
      setLocalError(errorMsg)
    }
  }

  if (isSuccess || (waitingForConfirmation && isSuccess)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-black/70 to-black/50 backdrop-blur-sm z-50">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center max-w-md border border-green-500/30">
          <div className="mb-4 w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="mb-2 text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            Ready on Farcaster!
          </h2>
          <p className="mb-3 text-gray-400">Transaction confirmed on Base Network</p>
          <p className="mb-4 text-xs text-gray-500 break-all font-mono bg-slate-800/50 p-2 rounded">{txHash}</p>
          <p className="text-sm text-cyan-300 font-medium">Starting your game on Farcaster...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-black/70 to-black/50 backdrop-blur-sm z-50 p-4">
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 max-w-md border border-cyan-500/20 shadow-2xl">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="mb-1 text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Ready to Play
            </h2>
            <p className="text-sm text-cyan-300">Complete payment on Base to start</p>
          </div>

          {/* Error Messages */}
          {(localError || isError) && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3">
              <p className="text-sm text-red-400 mb-2">
                {localError || (error instanceof Error ? error.message : "Payment failed")}
              </p>
              {error && (
                <button
                  onClick={() => reset()}
                  className="text-xs text-red-300 hover:text-red-200 underline transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          )}

          {/* Payment Details */}
          <div className="mb-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-cyan-500/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Amount</span>
              <span className="font-bold text-cyan-300">{PAYMENT_AMOUNT_USDC} USDC</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Network</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 font-medium">
                Base
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Token</span>
              <span className="text-xs text-gray-300">USDC (Official)</span>
            </div>
            {address && (
              <div className="border-t border-gray-700 pt-3">
                <span className="text-xs text-gray-400">Wallet: {address.slice(0, 8)}...{address.slice(-6)}</span>
              </div>
            )}
          </div>

          {/* Transaction Status */}
          {txHash && !isSuccess && (
            <div className="mb-4 rounded-lg bg-blue-500/10 border border-blue-500/30 p-3">
              <p className="text-xs text-blue-300 mb-2">
                {isConfirming ? "⏳ Confirming on Base..." : "✓ Transaction sent"}
              </p>
              <a
                href={`https://basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 underline transition-colors"
              >
                View on BaseScan
              </a>
            </div>
          )}

          {/* CTA Button */}
          <Button
            onClick={handlePayment}
            disabled={!isConnected || isPending || isConfirming || isSuccess}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-cyan-500/40"
          >
            {isSuccess
              ? "Payment Complete ✓"
              : isPending
                ? "Confirm in Wallet..."
                : isConfirming
                  ? "Confirming..."
                  : chainId !== base.id
                    ? "Switch to Base Network"
                    : isConnected
                      ? `Pay ${PAYMENT_AMOUNT_USDC} USDC`
                      : "Connect Wallet First"}
          </Button>

          {/* Footer */}
          <div className="mt-4 text-center text-xs text-gray-500">
            <p>Playing on Farcaster • Powered by Base Network</p>
          </div>
        </div>
      </div>
    </div>
  )
}
