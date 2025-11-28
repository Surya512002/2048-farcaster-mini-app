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
      const gameUrl =
        typeof window !== "undefined" ? window.location.href : "https://2048-farcaster-mini-app.vercel.app"
      const shareText = `🎮 I just scored ${score} points in 2048 Game! 

Can you beat my score? Challenge me now!

${gameUrl}

#2048Game #FarcasterMiniApp #GameChallenge`

      if (sdk) {
        try {
          await sdk.actions.composeCast({ body: shareText })
          console.log("[v0] Cast composed successfully with score")
        } catch (error) {
          console.error("[v0] composeCast failed:", error)
          // Fallback to clipboard
          if (typeof navigator !== "undefined" && navigator.clipboard) {
            await navigator.clipboard.writeText(shareText)
            alert("✅ Score challenge copied to clipboard!")
          }
        }
      } else {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(shareText)
          alert("✅ Score challenge copied to clipboard!\n\n(Farcaster sharing works after deployment)")
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
      title={sdk ? "Share score to Farcaster" : "Copy score (Deploy for Farcaster sharing)"}
    >
      {isSharing ? "Sharing..." : `Share Score (${score})`}
    </Button>
  )
}
