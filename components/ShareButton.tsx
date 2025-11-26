"use client"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface ShareButtonProps {
  score: number
}

export default function ShareButton({ score }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    setIsSharing(true)

    try {
      const shareText = `I just scored ${score} points in 2048! 🎮 Can you beat my score?`

      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText)
        alert("✅ Score copied to clipboard!\n\n(Farcaster sharing will work after deployment)")
      }
    } catch (error) {
      console.error("Error sharing:", error)
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
      title="Copy score (Deploy for Farcaster sharing)"
    >
      {isSharing ? "Copying..." : "Share Score"}
    </Button>
  )
}
