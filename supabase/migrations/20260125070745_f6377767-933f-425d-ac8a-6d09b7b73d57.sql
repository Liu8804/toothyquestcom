-- Add unique constraint for daily challenge progress upsert
-- This ensures one progress record per child per challenge per day
ALTER TABLE public.daily_challenge_progress 
DROP CONSTRAINT IF EXISTS daily_challenge_progress_unique;

ALTER TABLE public.daily_challenge_progress 
ADD CONSTRAINT daily_challenge_progress_unique 
UNIQUE (child_id, challenge_id, challenge_date);