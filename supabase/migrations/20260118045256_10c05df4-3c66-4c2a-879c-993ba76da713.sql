-- Create leaderboard opt-in table
CREATE TABLE public.leaderboard_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(child_id)
);

-- Enable RLS
ALTER TABLE public.leaderboard_profiles ENABLE ROW LEVEL SECURITY;

-- Parents can manage their children's leaderboard profiles
CREATE POLICY "Parents can view own children leaderboard profiles"
ON public.leaderboard_profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id = leaderboard_profiles.child_id
    AND children.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can insert own children leaderboard profiles"
ON public.leaderboard_profiles FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id = leaderboard_profiles.child_id
    AND children.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can update own children leaderboard profiles"
ON public.leaderboard_profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id = leaderboard_profiles.child_id
    AND children.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can delete own children leaderboard profiles"
ON public.leaderboard_profiles FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id = leaderboard_profiles.child_id
    AND children.parent_id = auth.uid()
  )
);

-- Anyone authenticated can view PUBLIC leaderboard entries
CREATE POLICY "Anyone can view public leaderboard profiles"
ON public.leaderboard_profiles FOR SELECT
TO authenticated
USING (is_public = true);

-- Create push subscription table
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own subscriptions
CREATE POLICY "Users can view own push subscriptions"
ON public.push_subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push subscriptions"
ON public.push_subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions"
ON public.push_subscriptions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Block updates (subscriptions should be replaced, not updated)
CREATE POLICY "Block push subscription updates"
ON public.push_subscriptions FOR UPDATE
TO authenticated
USING (false);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  morning_reminder BOOLEAN NOT NULL DEFAULT true,
  evening_reminder BOOLEAN NOT NULL DEFAULT true,
  streak_alerts BOOLEAN NOT NULL DEFAULT true,
  morning_time TIME NOT NULL DEFAULT '07:30:00',
  evening_time TIME NOT NULL DEFAULT '19:30:00',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own preferences
CREATE POLICY "Users can view own notification preferences"
ON public.notification_preferences FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
ON public.notification_preferences FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
ON public.notification_preferences FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notification preferences"
ON public.notification_preferences FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_leaderboard_profiles_updated_at
BEFORE UPDATE ON public.leaderboard_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get public leaderboard data with XP
CREATE OR REPLACE FUNCTION public.get_public_leaderboard(limit_count INTEGER DEFAULT 50)
RETURNS TABLE(
  child_id UUID,
  display_name TEXT,
  avatar_emoji TEXT,
  total_xp BIGINT,
  quests_completed BIGINT,
  badges_earned BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lp.child_id,
    lp.display_name,
    c.avatar_emoji,
    COALESCE(SUM(qp.xp_earned), 0)::BIGINT as total_xp,
    COUNT(DISTINCT qp.quest_id)::BIGINT as quests_completed,
    COUNT(DISTINCT eb.badge_id)::BIGINT as badges_earned
  FROM public.leaderboard_profiles lp
  INNER JOIN public.children c ON c.id = lp.child_id
  LEFT JOIN public.quest_progress qp ON qp.child_id = lp.child_id
  LEFT JOIN public.earned_badges eb ON eb.child_id = lp.child_id
  WHERE lp.is_public = true
  GROUP BY lp.child_id, lp.display_name, c.avatar_emoji
  ORDER BY total_xp DESC
  LIMIT limit_count;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_leaderboard(INTEGER) TO authenticated;