"use client"

import { useState, useEffect } from "react"
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"
import { Button } from "@/components/ui/button"
import { PAYMENT_AMOUNT_ETH, RECIPIENT_WALLET } from "@/lib/constants"

interface PaymentModalProps {
  onPaymentSuccess: () => void
  fid: number | null
}

export default function PaymentModal({ onPaymentSuccess, fid }: PaymentModalProps) {
  const { isConnected, address } = useAccount()
  const { sendTransaction, isPending, data: txHash, isError, error, reset } = useSendTransaction()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })
  const [localError, setLocalError] = useState<string>("")

  useEffect(() => {
    if (isSuccess) {
      setLocalError("")
      setTimeout(() => {
        onPaymentSuccess()
      }, 1000)
    }
  }, [isSuccess, onPaymentSuccess])

  const handlePayment = async () => {
    if (!isConnected) {
      setLocalError("Please connect your wallet first")
      return
    }

    try {
      setLocalError("")
      sendTransaction({
        to: RECIPIENT_WALLET as `0x${string}`,
        value: parseEther(PAYMENT_AMOUNT_ETH),
      })
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Payment failed")
    }
  }

  if (isSuccess) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50">
        <div className="rounded-lg bg-white p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-green-600">Payment Successful! ✓</h2>
          <p className="mb-2 text-gray-600">Transaction confirmed</p>
          <p className="mb-6 text-sm text-gray-500">{txHash}</p>
          <p className="text-gray-600">Starting game...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="rounded-lg bg-white p-8 text-center">
        <h2 className="mb-2 text-2xl font-bold text-[#776e65]">Game Fee Required</h2>
        <p className="mb-6 text-gray-600">Pay {PAYMENT_AMOUNT_ETH} ETH on Base Network to play</p>

        {(localError || isError) && (
          <div className="mb-4 rounded bg-red-100 p-2 text-sm text-red-700">
            {localError || (error instanceof Error ? error.message : "Payment failed")}
            {error && (
              <button onClick={() => reset()} className="ml-2 text-xs underline">
                Retry
              </button>
            )}
          </div>
        )}

        <div className="mb-6 rounded bg-[#faf8ef] p-4">
          <p className="text-sm text-gray-700">
            Amount: <strong>{PAYMENT_AMOUNT_ETH} ETH</strong>
          </p>
          <p className="text-xs text-gray-500">Network: Base</p>
          {fid && <p className="text-xs text-gray-500">FID: {fid}</p>}
        </div>

        {txHash && !isSuccess && (
          <div className="mb-4 rounded bg-blue-100 p-2 text-sm text-blue-700">
            {isConfirming ? "Confirming transaction..." : "Transaction sent, waiting for confirmation..."}
          </div>
        )}

        <Button
          onClick={handlePayment}
          disabled={!isConnected || isPending || isConfirming || isSuccess}
          className="w-full bg-[#8f7a66] hover:bg-[#9f8a76] disabled:opacity-50"
        >
          {isSuccess
            ? "Payment Complete"
            : isPending
              ? "Confirm in Wallet..."
              : isConfirming
                ? "Confirming..."
                : isConnected
                  ? "Pay Now"
                  : "Connect Wallet First"}
        </Button>
      </div>
    </div>
  )
}
