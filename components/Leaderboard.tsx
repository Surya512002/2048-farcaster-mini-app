"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAccount } from "wagmi"

type LeaderboardEntry = {
  id: number
  name: string
  score: number
  rank: number
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { address } = useAccount()

  useEffect(() => {
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
  }, [])

  const formatAddress = (addr: string) => {
    if (!addr) return "Anonymous"
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (loading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Top Players</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#bbada0] border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-[#776e65]">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl bg-gradient-to-b from-[#faf8ef] to-[#f5f0e6] border-4 border-[#bbada0] shadow-xl">
      <CardHeader className="bg-gradient-to-r from-[#8f7a66] to-[#9f8a76]">
        <CardTitle className="text-center text-3xl text-white drop-shadow-lg">🏆 Top Players</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {leaderboard
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between rounded-lg p-4 transition-all shadow-md border-2 ${
                  index === 0
                    ? "bg-gradient-to-r from-[#f5d76e] to-[#edc22e] border-[#f5a623]"
                    : index === 1
                      ? "bg-gradient-to-r from-[#e8e8e8] to-[#d8d8d8] border-[#c0c0c0]"
                      : index === 2
                        ? "bg-gradient-to-r from-[#f4a460] to-[#d4714d] border-[#c17d4d]"
                        : "bg-[#eee4da] border-[#bbada0]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white drop-shadow-lg ${
                      index === 0
                        ? "bg-[#f5a623]"
                        : index === 1
                          ? "bg-[#c0c0c0]"
                          : index === 2
                            ? "bg-[#c17d4d]"
                            : "bg-[#8f7a66]"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="font-bold text-[#776e65] text-base">{formatAddress(entry.name)}</span>
                </div>
                <span className="font-bold text-[#8f7a66] text-xl">{entry.score.toLocaleString()}</span>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
