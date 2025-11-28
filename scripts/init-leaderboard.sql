-- Create weekly_scores table to store all game scores
CREATE TABLE IF NOT EXISTS weekly_scores (
  id BIGSERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  farcaster_username TEXT,
  fid INTEGER,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  week_start DATE NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_weekly_scores_week_start ON weekly_scores(week_start);
CREATE INDEX IF NOT EXISTS idx_weekly_scores_wallet ON weekly_scores(wallet_address);
CREATE INDEX IF NOT EXISTS idx_weekly_scores_created ON weekly_scores(created_at DESC);

-- Create leaderboard_cache table for cached weekly results
CREATE TABLE IF NOT EXISTS leaderboard_cache (
  id BIGSERIAL PRIMARY KEY,
  week_start DATE NOT NULL UNIQUE,
  leaderboard_data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  refreshed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_week ON leaderboard_cache(week_start DESC);
