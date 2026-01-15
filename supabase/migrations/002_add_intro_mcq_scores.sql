-- Migration: Add intro_score and mcq_score columns for the 2 new levels
-- Level 1: Complete-the-verse (intro)
-- Level 2: Multiple choice quotation (mcq)

-- Add new columns with default value of 0 for existing records
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS intro_score INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS mcq_score INTEGER NOT NULL DEFAULT 0;

-- Optional: Add a comment for documentation
COMMENT ON COLUMN players.intro_score IS 'Level 1: Complete-the-verse score';
COMMENT ON COLUMN players.mcq_score IS 'Level 2: Multiple choice quotation score';

