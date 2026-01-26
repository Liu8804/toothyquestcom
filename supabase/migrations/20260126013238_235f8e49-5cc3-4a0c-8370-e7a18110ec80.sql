-- Add daily_task_reminder_time to notification_preferences
ALTER TABLE public.notification_preferences
ADD COLUMN IF NOT EXISTS daily_task_reminder boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS daily_task_reminder_time time without time zone NOT NULL DEFAULT '19:00:00',
ADD COLUMN IF NOT EXISTS last_reminder_sent_at timestamp with time zone;

-- Create streak_recoveries table for tracking weekly recovery limit
CREATE TABLE IF NOT EXISTS public.streak_recoveries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  recovered_at timestamp with time zone NOT NULL DEFAULT now(),
  recovered_date date NOT NULL,
  previous_streak integer NOT NULL DEFAULT 0,
  restored_streak integer NOT NULL DEFAULT 0,
  parent_confirmed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on streak_recoveries
ALTER TABLE public.streak_recoveries ENABLE ROW LEVEL SECURITY;

-- Users can view their own streak recoveries
CREATE POLICY "Users can view own streak recoveries"
ON public.streak_recoveries
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own streak recoveries
CREATE POLICY "Users can insert own streak recoveries"
ON public.streak_recoveries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Block updates to streak_recoveries (immutable)
CREATE POLICY "Block streak recovery updates"
ON public.streak_recoveries
FOR UPDATE
USING (false);

-- Block deletes to streak_recoveries
CREATE POLICY "Block streak recovery deletes"
ON public.streak_recoveries
FOR DELETE
USING (false);

-- Add index for efficient lookup
CREATE INDEX IF NOT EXISTS idx_streak_recoveries_user_date 
ON public.streak_recoveries (user_id, recovered_at DESC);