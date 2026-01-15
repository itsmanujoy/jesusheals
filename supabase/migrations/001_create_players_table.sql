-- Create players table for leaderboard
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  security_code TEXT,
  final_score INTEGER NOT NULL,
  easy_score INTEGER NOT NULL,
  medium_score INTEGER NOT NULL,
  hard_score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient leaderboard queries
CREATE INDEX IF NOT EXISTS idx_players_score ON players(final_score DESC, created_at ASC);

-- Enable Row Level Security (optional, adjust as needed)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read (for leaderboard)
CREATE POLICY "Allow public read access" ON players
  FOR SELECT
  USING (true);

-- Policy: Allow anyone to insert (for submitting scores)
CREATE POLICY "Allow public insert access" ON players
  FOR INSERT
  WITH CHECK (true);

-- Optional: Policy to allow admin to delete (adjust based on your auth setup)
-- CREATE POLICY "Allow admin delete access" ON players
--   FOR DELETE
--   USING (auth.role() = 'authenticated');

