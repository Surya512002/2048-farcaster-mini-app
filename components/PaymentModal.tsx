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

      // Encode the transfer function call
      const data = encodeFunctionData({
        abi: USDC_ABI,
        functionName: "transfer",
        args: [RECIPIENT_WALLET as `0x${string}`, BigInt(PAYMENT_AMOUNT_USDC_WEI)],
      })

      sendTransaction({
        to: USDC_TOKEN_ADDRESS as `0x${string}`,
        data,
        chainId: base.id,
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Payment failed"
      console.log("[v0] Payment error:", errorMsg)
      setLocalError(errorMsg)
    }
  }

  if (isSuccess || (waitingForConfirmation && isSuccess)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="rounded-lg bg-white p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-green-600">Payment Successful!</h2>
          <p className="mb-2 text-gray-600">Transaction confirmed on Base Network</p>
          <p className="mb-6 text-sm text-gray-500 break-all">{txHash}</p>
          <p className="text-gray-600">Starting your game...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="rounded-lg bg-white p-8 text-center max-w-md">
        <h2 className="mb-2 text-2xl font-bold text-[#776e65]">Game Fee Required</h2>
        <p className="mb-6 text-gray-600">Pay {PAYMENT_AMOUNT_USDC} USDC on Base Network to play</p>

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
            Amount: <strong>{PAYMENT_AMOUNT_USDC} USDC</strong>
          </p>
          <p className="text-xs text-gray-500">Network: Base (Chain ID: {base.id})</p>
          <p className="text-xs text-gray-500">Token: USDC (Official)</p>
          {fid && <p className="text-xs text-gray-500">FID: {fid}</p>}
          {address && (
            <p className="text-xs text-gray-500">
              From: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          )}
        </div>

        {txHash && !isSuccess && (
          <div className="mb-4 rounded bg-blue-100 p-2 text-sm text-blue-700">
            {isConfirming ? "Confirming transaction..." : "Transaction sent, waiting for confirmation..."}
            <br />
            <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs underline">
              View on BaseScan
            </a>
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
                : chainId !== base.id
                  ? "Switch to Base Network"
                  : isConnected
                    ? `Pay ${PAYMENT_AMOUNT_USDC} USDC`
                    : "Connect Wallet First"}
        </Button>
      </div>
    </div>
  )
}
