-- Create game_state table to track level unlock status
CREATE TABLE IF NOT EXISTS public.game_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  levels_unlocked JSONB DEFAULT '{"1": false, "2": false, "3": false, "4": false, "5": false}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT only_one_row CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE public.game_state ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all to read
CREATE POLICY "Allow read game_state" ON public.game_state
  FOR SELECT USING (true);

-- Create a policy that allows all to update
CREATE POLICY "Allow update game_state" ON public.game_state
  FOR UPDATE USING (true);

-- Create a policy that allows insert
CREATE POLICY "Allow insert game_state" ON public.game_state
  FOR INSERT WITH CHECK (true);

-- Insert the initial record
INSERT INTO public.game_state (id, levels_unlocked) 
VALUES (1, '{"1": false, "2": false, "3": false, "4": false, "5": false}'::jsonb)
ON CONFLICT (id) DO NOTHING;
