# Farcaster Mini App Deployment Guide

## 🎮 Your 2048 Game is Ready!

The game works perfectly in preview mode. To enable **full Farcaster Mini App features**, follow these deployment steps:

## Step 1: Deploy to Vercel

Click the **"Publish"** button in v0 to deploy your app to Vercel.

## Step 2: Add Farcaster SDK (After Deployment)

Once deployed, add the Farcaster SDK to your production app:

\`\`\`bash
npm install @farcaster/frame-sdk
\`\`\`

## Step 3: Update Your Code

### Update `app/page.tsx`:

\`\`\`tsx
"use client"

import { useEffect, useState } from "react"
import Game2048 from "@/components/Game2048"
import sdk from "@farcaster/frame-sdk"

export default function Home() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false)

  useEffect(() => {
    const initSDK = async () => {
      try {
        // Initialize Farcaster SDK - this is required!
        await sdk.actions.ready()
        setIsSDKLoaded(true)
      } catch (error) {
        console.error("Failed to initialize SDK:", error)
        // Still show the game even if SDK fails
        setIsSDKLoaded(true)
      }
    }

    initSDK()
  }, [])

  if (!isSDKLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8ef]">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-[#776e65]">Loading 2048...</div>
          <div className="h-2 w-48 overflow-hidden rounded-full bg-[#cdc1b4]">
            <div className="h-full w-1/2 animate-pulse bg-[#edc22e]"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#faf8ef] p-4">
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-5xl font-bold text-[#776e65]">2048</h1>
        <p className="text-sm text-[#776e65]">
          Join the tiles, get to <strong>2048!</strong>
        </p>
      </div>
      <Game2048 />
    </main>
  )
}
\`\`\`

### Update `components/ShareButton.tsx`:

\`\`\`tsx
"use client"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import sdk from "@farcaster/frame-sdk"

interface ShareButtonProps {
  score: number
}

export default function ShareButton({ score }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    setIsSharing(true)

    try {
      const shareText = `I just scored ${score} points in 2048! 🎮 Can you beat my score?`

      // Use Farcaster composeCast to share directly in Warpcast
      await sdk.actions.composeCast({
        text: shareText,
      })
    } catch (error) {
      console.error("Error sharing:", error)
      // Fallback to clipboard
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText)
        alert("✅ Score copied to clipboard!")
      }
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Button
      onClick={handleShare}
      disabled={isSharing}
      className="bg-[#edc22e] text-white hover:bg-[#edcc61] disabled:opacity-50"
    >
      {isSharing ? "Sharing..." : "Share Score"}
    </Button>
  )
}
\`\`\`

## Step 4: Update Manifest

Make sure `public/.well-known/farcaster.json` has your production URL:

\`\`\`json
{
  "accountAssociation": {
    "header": "eyJmaWQiOjEyMzQ1LCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4MTIzLi4uIn0",
    "payload": "eyJkb21haW4iOiJ5b3VyLWRvbWFpbi52ZXJjZWwuYXBwIn0",
    "signature": "MHg..."
  },
  "frame": {
    "version": "1",
    "name": "2048 Game",
    "iconUrl": "https://your-domain.vercel.app/icon.png",
    "homeUrl": "https://your-domain.vercel.app",
    "splashImageUrl": "https://your-domain.vercel.app/splash.png",
    "splashBackgroundColor": "#faf8ef"
  }
}
\`\`\`

Replace `your-domain.vercel.app` with your actual Vercel deployment URL.

## Step 5: Test Your Mini App

Use the [Farcaster Mini App Preview Tool](https://warpcast.com/~/developers/mini-apps) to test your deployed app.

---

## Important Notes

- **`sdk.actions.ready()` is required** - This tells Farcaster the app is loaded and removes the splash screen
- The SDK only works on your deployed domain, not in v0 preview
- Make sure your manifest domain matches your deployment URL exactly

## Current Preview Mode

Your game is fully functional in v0 preview! The only difference is that sharing uses clipboard instead of Farcaster's `composeCast()`. All game features work perfectly.
