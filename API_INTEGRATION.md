# API Integration Guide

This 2048 game now includes API integration for leaderboard functionality.

## Current Setup (Demo)

The app currently uses **JSONPlaceholder** (https://jsonplaceholder.typicode.com) as a free demo API. This is a fake REST API for testing and prototyping.

**Note:** JSONPlaceholder doesn't persist data - it's only for demonstration. Scores are not actually saved.

## Upgrading to Real Database

### Option 1: Supabase (Recommended)

Supabase provides a free PostgreSQL database with real-time capabilities.

1. **Add Supabase integration** from v0's Connect section
2. **Create a leaderboard table:**

\`\`\`sql
create table leaderboard (
  id uuid default gen_random_uuid() primary key,
  player_name text not null,
  score integer not null,
  created_at timestamp with time zone default now()
);

-- Add index for faster queries
create index leaderboard_score_idx on leaderboard(score desc);
\`\`\`

3. **Update `app/api/leaderboard/route.ts`:**

\`\`\`typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('score', { ascending: false })
    .limit(10)
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const { name, score } = await request.json()
  
  const { data, error } = await supabase
    .from('leaderboard')
    .insert({ player_name: name, score })
    .select()
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}
\`\`\`

### Option 2: Other Free APIs

- **Firebase**: Google's real-time database
- **MongoDB Atlas**: Free 512MB database
- **PlanetScale**: MySQL-compatible serverless database
- **Upstash**: Redis for leaderboards (fast!)

## Features to Add

1. **User Authentication**: Connect wallet address or Farcaster ID to scores
2. **Daily/Weekly Leaderboards**: Time-based rankings
3. **Personal Best**: Track individual player records
4. **Real-time Updates**: Use WebSockets for live leaderboard updates
5. **Anti-cheat**: Server-side game validation

## Current API Endpoints

- `GET /api/leaderboard` - Fetch top 10 scores
- `POST /api/leaderboard` - Submit a new score

## Testing

The leaderboard currently displays random mock data. When you deploy with a real database, scores will persist and display actual player data.
