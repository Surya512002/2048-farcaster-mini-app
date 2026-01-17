"use client"

import { useEffect, useState } from "react"
import { getWeekStartString } from "@/lib/weekly-leaderboard"

type LeaderboardEntry = {
  id: number
  wallet_address: string
  farcaster_username: string
  score: number
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState("")

  useEffect(() => {
    setWeekStart(getWeekStartString())

    async function fetchLeaderboard() {
      try {
        const response = await fetch("/api/leaderboard")
        if (!response.ok) throw new Error("Failed to fetch leaderboard")

        const data = await response.json()
        setLeaderboard(data)
      } catch (err) {
        console.error("[v0] Error fetching leaderboard:", err)
        setError("Failed to load leaderboard")
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()

    // Refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatAddress = (addr: string) => {
    if (!addr || addr === "Anonymous") return "Anonymous"
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getWeekEndDate = () => {
    const start = new Date(weekStart)
    const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000)
    return end.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  if (loading) {
    return (
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4dd9ff] border-t-transparent" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl text-center">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl border-2 border-[#4dd9ff]/50 rounded-lg overflow-hidden shadow-2xl glow-cyan">
      <div className="bg-gradient-to-r from-[#0a0e27] via-[#1a0a3e] to-[#0f0820] border-b-2 border-[#ff00ff]/50 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#4dd9ff] drop-shadow-lg mb-1">🏆 Weekly Leaderboard</h2>
          <p className="text-xs text-[#ff00ff]">Refreshes every Sunday (UTC+5:30)</p>
          {weekStart && <p className="text-xs text-[#4dd9ff]/75">Week starting: {weekStart}</p>}
        </div>
      </div>
      <div className="bg-[#0a0e27]/80 backdrop-blur p-4">
        {leaderboard.length === 0 ? (
          <p className="text-center text-[#4dd9ff]/75 py-8">No scores yet. Play a game to join the leaderboard!</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between rounded-lg p-3 transition-all border-2 ${
                  index === 0
                    ? "bg-[#ffff00]/20 border-[#ffff00] shadow-lg shadow-[#ffff00]/50"
                    : index === 1
                      ? "bg-[#4dd9ff]/20 border-[#4dd9ff] shadow-lg shadow-[#4dd9ff]/50"
                      : index === 2
                        ? "bg-[#ff00ff]/20 border-[#ff00ff] shadow-lg shadow-[#ff00ff]/50"
                        : "bg-[#4dd9ff]/10 border-[#4dd9ff]/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-white drop-shadow-lg text-sm ${
                      index === 0
                        ? "bg-[#ffff00]"
                        : index === 1
                          ? "bg-[#4dd9ff]"
                          : index === 2
                            ? "bg-[#ff00ff]"
                            : "bg-[#4dd9ff]/60"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-[#4dd9ff] text-sm">{formatAddress(entry.wallet_address)}</span>
                    <span className="text-xs text-[#ff00ff]/75">{entry.farcaster_username || "Farcaster User"}</span>
                  </div>
                </div>
                <span className="font-bold text-[#ffff00] text-lg">{entry.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
