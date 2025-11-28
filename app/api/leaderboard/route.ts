import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getWeekStartString } from "@/lib/weekly-leaderboard"

async function getSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Handle errors silently
        }
      },
    },
  })
}

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseClient()
    const weekStart = getWeekStartString()

    const { data, error } = await supabase
      .from("weekly_scores")
      .select("wallet_address, farcaster_username, score, created_at")
      .eq("week_start", weekStart)
      .order("score", { ascending: false })
      .limit(10)

    if (error) throw error

    // Group by wallet address and get highest score
    const leaderboard = Object.values(
      (data || []).reduce((acc: any, entry: any) => {
        const key = entry.wallet_address
        if (!acc[key] || entry.score > acc[key].score) {
          acc[key] = {
            id: Math.random(),
            wallet_address: entry.wallet_address,
            farcaster_username: entry.farcaster_username || "Anonymous",
            score: entry.score,
          }
        }
        return acc
      }, {}),
    )

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error("[v0] Leaderboard API error:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseClient()
    const body = await request.json()
    const { wallet_address, farcaster_username, fid, score } = body

    if (!wallet_address || score === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const weekStart = getWeekStartString()

    const { data, error } = await supabase
      .from("weekly_scores")
      .insert({
        wallet_address,
        farcaster_username: farcaster_username || null,
        fid: fid || null,
        score,
        week_start: weekStart,
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) throw error

    console.log("[v0] Score submitted to weekly leaderboard:", data)

    return NextResponse.json({
      success: true,
      message: "Score submitted to weekly leaderboard",
      data,
    })
  } catch (error) {
    console.error("[v0] Submit score error:", error)
    return NextResponse.json({ error: "Failed to submit score" }, { status: 500 })
  }
}
