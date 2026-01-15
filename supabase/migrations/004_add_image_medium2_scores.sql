-- Migration: Add image_score and medium2_score columns for the 2 new levels
-- Level 3: Image identification (image)
-- Level 5: Medium2 fragment arrange (medium2)

-- Add new columns with default value of 0 for existing records
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS image_score INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS medium2_score INTEGER NOT NULL DEFAULT 0;

-- Optional: Add a comment for documentation
COMMENT ON COLUMN players.image_score IS 'Level 3: Image identification score';
COMMENT ON COLUMN players.medium2_score IS 'Level 5: Medium2 fragment arrange score';

-- Update game_state to support 7 levels instead of 5
UPDATE public.game_state 
SET levels_unlocked = '{"1": false, "2": false, "3": false, "4": false, "5": false, "6": false, "7": false}'::jsonb
WHERE id = 1;
