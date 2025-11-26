import { NextResponse } from "next/server"

// Using JSONPlaceholder as a demo API
// In production, replace with your actual leaderboard API (Supabase, Firebase, etc.)
const API_BASE_URL = "https://jsonplaceholder.typicode.com"

export async function GET() {
  try {
    // Fetch leaderboard data
    // In a real app, this would fetch from your database
    const response = await fetch(`${API_BASE_URL}/users?_limit=10`)
    const users = await response.json()

    // Mock leaderboard data
    const leaderboard = users.map((user: any, index: number) => ({
      id: user.id,
      name: user.name,
      score: Math.floor(Math.random() * 10000) + 1000,
      rank: index + 1,
    }))

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error("[v0] Leaderboard API error:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, score } = body

    // In a real app, save to database
    // For demo, we'll just echo back the data
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        score,
        timestamp: new Date().toISOString(),
      }),
    })

    const data = await response.json()
    console.log("[v0] Score submitted:", data)

    return NextResponse.json({
      success: true,
      message: "Score submitted successfully",
      data,
    })
  } catch (error) {
    console.error("[v0] Submit score error:", error)
    return NextResponse.json({ error: "Failed to submit score" }, { status: 500 })
  }
}
