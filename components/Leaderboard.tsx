"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Top Players</CardTitle>
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
      <Card className="w-full max-w-md">
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Top Players</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard
            .sort((a, b) => b.score - a.score)
            .map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg bg-[#eee4da] p-3 transition-colors hover:bg-[#ede0c8]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8f7a66] text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <span className="font-medium text-[#776e65]">{entry.name}</span>
                </div>
                <span className="font-bold text-[#8f7a66]">{entry.score.toLocaleString()}</span>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
