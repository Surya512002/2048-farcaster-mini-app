"use client"

import { useState } from "react"
import { useAccount, useSendTransaction } from "wagmi"
import { parseEther } from "viem"
import { Button } from "@/components/ui/button"
import { PAYMENT_AMOUNT_ETH, RECIPIENT_WALLET } from "@/lib/constants"

interface PaymentModalProps {
  onPaymentSuccess: () => void
  fid: number | null
}

export default function PaymentModal({ onPaymentSuccess, fid }: PaymentModalProps) {
  const { isConnected, address } = useAccount()
  const { sendTransaction, isPending, isSuccess, isError, error } = useSendTransaction()
  const [localError, setLocalError] = useState<string>("")

  const handlePayment = async () => {
    if (!isConnected) {
      setLocalError("Please connect your wallet first")
      return
    }

    try {
      setLocalError("")
      sendTransaction({
        account: address,
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
          <p className="mb-6 text-gray-600">You can now start playing 2048</p>
          <Button onClick={onPaymentSuccess} className="bg-[#8f7a66] hover:bg-[#9f8a76]">
            Start Playing
          </Button>
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
          </div>
        )}

        <div className="mb-6 rounded bg-[#faf8ef] p-4">
          <p className="text-sm text-gray-700">
            Amount: <strong>{PAYMENT_AMOUNT_ETH} ETH</strong>
          </p>
          <p className="text-xs text-gray-500">Network: Base</p>
          {fid && <p className="text-xs text-gray-500">FID: {fid}</p>}
        </div>

        <Button
          onClick={handlePayment}
          disabled={!isConnected || isPending}
          className="w-full bg-[#8f7a66] hover:bg-[#9f8a76] disabled:opacity-50"
        >
          {isPending ? "Processing..." : isConnected ? "Pay Now" : "Connect Wallet First"}
        </Button>
      </div>
    </div>
  )
}
