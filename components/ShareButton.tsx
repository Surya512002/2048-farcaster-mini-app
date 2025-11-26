"use client"
import { Button } from "@/components/ui/button"
import { useState } from "react"

type FarcasterSDK = {
  actions: {
    composeCast: (options: { body: string }) => Promise<void>
  }
}

interface ShareButtonProps {
  score: number
  sdk: FarcasterSDK | null
}

export default function ShareButton({ score, sdk }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    setIsSharing(true)

    try {
      const shareText = `I just scored ${score} points in 2048! 🎮 Can you beat my score? ${window.location.href}`

      if (sdk) {
        try {
          await sdk.actions.composeCast({ body: shareText })
          console.log("[v0] Cast composed successfully")
        } catch (error) {
          console.error("[v0] composeCast failed:", error)
          // Fallback to clipboard
          if (typeof navigator !== "undefined" && navigator.clipboard) {
            await navigator.clipboard.writeText(shareText)
            alert("✅ Score copied to clipboard!")
          }
        }
      } else {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(shareText)
          alert("✅ Score copied to clipboard!\n\n(Farcaster sharing works after deployment)")
        }
      }
    } catch (error) {
      console.error("[v0] Error sharing:", error)
      alert("Unable to share. Please try again.")
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Button
      onClick={handleShare}
      disabled={isSharing}
      className="bg-[#edc22e] text-white hover:bg-[#edcc61] disabled:opacity-50"
      title={sdk ? "Share to Farcaster" : "Copy score (Deploy for Farcaster sharing)"}
    >
      {isSharing ? "Sharing..." : "Share Score"}
    </Button>
  )
}
