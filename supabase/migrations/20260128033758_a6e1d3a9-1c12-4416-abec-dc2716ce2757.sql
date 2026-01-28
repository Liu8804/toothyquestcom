-- Create tester_accounts table for managing 7-day trial users
CREATE TABLE public.tester_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  trial_start_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  trial_end_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  welcome_shown BOOLEAN NOT NULL DEFAULT false,
  expiry_shown BOOLEAN NOT NULL DEFAULT false,
  day6_reminder_sent BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tester_usage_logs table for tracking screen visits and time spent
CREATE TABLE public.tester_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  screen_name TEXT NOT NULL,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  session_id TEXT,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create tester_activity_summary view-like table for aggregated stats
CREATE TABLE public.tester_activity_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_screens_visited INTEGER NOT NULL DEFAULT 0,
  total_time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  quests_completed INTEGER NOT NULL DEFAULT 0,
  games_played INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tester_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tester_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tester_activity_summary ENABLE ROW LEVEL SECURITY;

-- Tester accounts policies
CREATE POLICY "Users can view their own tester status"
ON public.tester_accounts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tester accounts"
ON public.tester_accounts FOR SELECT
USING (public.current_user_has_role('admin'::app_role));

CREATE POLICY "Admins can insert tester accounts"
ON public.tester_accounts FOR INSERT
WITH CHECK (public.current_user_has_role('admin'::app_role));

CREATE POLICY "Admins can update tester accounts"
ON public.tester_accounts FOR UPDATE
USING (public.current_user_has_role('admin'::app_role));

CREATE POLICY "Users can update their own welcome/expiry flags"
ON public.tester_accounts FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can delete tester accounts"
ON public.tester_accounts FOR DELETE
USING (public.current_user_has_role('admin'::app_role));

-- Usage logs policies
CREATE POLICY "Users can insert their own usage logs"
ON public.tester_usage_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own usage logs"
ON public.tester_usage_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage logs"
ON public.tester_usage_logs FOR SELECT
USING (public.current_user_has_role('admin'::app_role));

CREATE POLICY "Block usage log updates"
ON public.tester_usage_logs FOR UPDATE
USING (false);

CREATE POLICY "Block usage log deletes"
ON public.tester_usage_logs FOR DELETE
USING (false);

-- Activity summary policies
CREATE POLICY "Users can view their own activity summary"
ON public.tester_activity_summary FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity summaries"
ON public.tester_activity_summary FOR SELECT
USING (public.current_user_has_role('admin'::app_role));

CREATE POLICY "Users can upsert their own activity summary"
ON public.tester_activity_summary FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity summary"
ON public.tester_activity_summary FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to check if user is an active tester
CREATE OR REPLACE FUNCTION public.is_active_tester(check_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tester_accounts
    WHERE user_id = COALESCE(check_user_id, auth.uid())
      AND is_active = true
      AND now() >= trial_start_at
      AND now() < trial_end_at
  )
$$;

-- Create function to get tester trial info
CREATE OR REPLACE FUNCTION public.get_tester_info(check_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  is_tester BOOLEAN,
  is_active BOOLEAN,
  trial_start_at TIMESTAMP WITH TIME ZONE,
  trial_end_at TIMESTAMP WITH TIME ZONE,
  days_remaining INTEGER,
  welcome_shown BOOLEAN,
  expiry_shown BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    true as is_tester,
    (ta.is_active AND now() >= ta.trial_start_at AND now() < ta.trial_end_at) as is_active,
    ta.trial_start_at,
    ta.trial_end_at,
    GREATEST(0, EXTRACT(DAY FROM (ta.trial_end_at - now()))::INTEGER) as days_remaining,
    ta.welcome_shown,
    ta.expiry_shown
  FROM public.tester_accounts ta
  WHERE ta.user_id = COALESCE(check_user_id, auth.uid())
  LIMIT 1
$$;

-- Create trigger for updated_at on tester_accounts
CREATE TRIGGER update_tester_accounts_updated_at
BEFORE UPDATE ON public.tester_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_tester_accounts_user_id ON public.tester_accounts(user_id);
CREATE INDEX idx_tester_accounts_active ON public.tester_accounts(is_active, trial_end_at);
CREATE INDEX idx_tester_usage_logs_user_id ON public.tester_usage_logs(user_id);
CREATE INDEX idx_tester_usage_logs_visited_at ON public.tester_usage_logs(visited_at);
CREATE INDEX idx_tester_activity_summary_user_id ON public.tester_activity_summary(user_id);