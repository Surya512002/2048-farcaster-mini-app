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
    if (score === 0) {
      alert("Play a game and get a score before sharing!")
      return
    }

    setIsSharing(true)

    try {
      const gameUrl = "https://2048-farcaster-mini-app.vercel.app"
      
      // Create a compelling share message with the score and link
      const shareText = `I just scored ${score} points in 2048! 

Can you beat my score? Play and challenge me now!

${gameUrl}

#2048Game #FarcasterMiniApp #BaseChain`

      console.log("[v0] Share message:", shareText)

      if (sdk && sdk.actions && sdk.actions.composeCast) {
        try {
          await sdk.actions.composeCast({ body: shareText })
          console.log("[v0] Cast composed successfully with score and link")
        } catch (sdkError) {
          console.error("[v0] SDK composeCast error:", sdkError)
          // Fallback to clipboard
          if (navigator?.clipboard) {
            await navigator.clipboard.writeText(shareText)
            alert(`✅ Score shared!\n\nYour Score: ${score}\nGame Link: ${gameUrl}`)
          }
        }
      } else {
        console.log("[v0] SDK not available, using clipboard fallback")
        if (navigator?.clipboard) {
          await navigator.clipboard.writeText(shareText)
          alert(`✅ Score copied!\n\nScore: ${score}\nLink: ${gameUrl}\n\nShare it on Farcaster!`)
        }
      }
    } catch (error) {
      console.error("[v0] Error in share handler:", error)
      alert("Unable to share. Please try again.")
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Button
      onClick={handleShare}
      disabled={isSharing || score === 0}
      className="bg-[#edc22e] text-white hover:bg-[#edcc61] disabled:opacity-50 font-bold"
      title={score > 0 ? "Share your score and challenge friends" : "Finish a game to share your score"}
    >
      {isSharing ? "Sharing..." : `Share Score (${score})`}
    </Button>
  )
}
