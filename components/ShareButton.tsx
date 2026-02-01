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
      const shareText = `🎮 I just scored ${score} points on the 2048 Farcaster Base App! 

Playing on Base network, can you beat my score? Challenge me now!

🔗 ${gameUrl}

#2048MiniApp #FarcasterBaseApp #BaseNetwork #FarcasterGaming`

      console.log("[v0] Share message:", shareText)
      console.log("[v0] SDK available:", !!sdk)

      if (sdk && sdk.actions && sdk.actions.composeCast) {
        try {
          await sdk.actions.composeCast({ body: shareText })
          console.log("[v0] Cast composed successfully with score and link")
          alert(`✅ Score posted on Farcaster Base App!\n\nScore: ${score}`)
        } catch (sdkError) {
          console.error("[v0] SDK composeCast error:", sdkError)
          // Fallback to clipboard
          await fallbackToClipboard(shareText, gameUrl)
        }
      } else {
        console.log("[v0] SDK not available, using clipboard fallback")
        await fallbackToClipboard(shareText, gameUrl)
      }
    } catch (error) {
      console.error("[v0] Error in share handler:", error)
      alert("❌ Unable to share. Please try again.")
    } finally {
      setIsSharing(false)
    }
  }

  const fallbackToClipboard = async (shareText: string, gameUrl: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText)
        alert(`✅ Score challenge copied to clipboard!\n\nScore: ${score}\nApp: Farcaster Base App\nGame: ${gameUrl}\n\nPaste and share on Farcaster!`)
      } else {
        // Fallback for browsers without clipboard API
        const textArea = document.createElement("textarea")
        textArea.value = shareText
        document.body.appendChild(textArea)
        textArea.select()
        try {
          document.execCommand("copy")
          alert(`✅ Score copied!\n\nScore: ${score}\nShare on Farcaster Base App: ${gameUrl}`)
        } catch (err) {
          console.error("[v0] Copy failed:", err)
          alert(`Share your score: ${score}\n\nFarcaster Base App: ${gameUrl}`)
        }
        document.body.removeChild(textArea)
      }
    } catch (error) {
      console.error("[v0] Clipboard fallback error:", error)
      alert(`Share your score: ${score}\n\nFarcaster Base App: ${gameUrl}`)
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
