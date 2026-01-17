-- Create daily_challenges table to track challenge definitions
CREATE TABLE public.daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '⭐',
  xp_reward INTEGER NOT NULL DEFAULT 10,
  challenge_type TEXT NOT NULL, -- 'brush', 'story', 'game', 'floss'
  target_count INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_challenge_progress table to track user's daily progress
CREATE TABLE public.daily_challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  challenge_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_count INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(child_id, challenge_id, challenge_date)
);

-- Enable RLS
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Policies for daily_challenges (public read)
CREATE POLICY "Anyone can view active challenges"
ON public.daily_challenges
FOR SELECT
USING (is_active = true);

-- Policies for daily_challenge_progress
CREATE POLICY "Users can view their children's challenge progress"
ON public.daily_challenge_progress
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.children
    WHERE id = daily_challenge_progress.child_id
    AND parent_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their children's challenge progress"
ON public.daily_challenge_progress
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.children
    WHERE id = daily_challenge_progress.child_id
    AND parent_id = auth.uid()
  )
);

CREATE POLICY "Users can update their children's challenge progress"
ON public.daily_challenge_progress
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.children
    WHERE id = daily_challenge_progress.child_id
    AND parent_id = auth.uid()
  )
);

-- Insert default daily challenges
INSERT INTO public.daily_challenges (title, description, emoji, xp_reward, challenge_type, target_count) VALUES
('Morning Brusher', 'Complete a morning brushing session', '🌅', 15, 'brush', 1),
('Night Brusher', 'Complete an evening brushing session', '🌙', 15, 'brush', 1),
('Story Explorer', 'Read a dental adventure story', '📚', 10, 'story', 1),
('Game Champion', 'Play any mini-game', '🎮', 10, 'game', 1),
('Floss Hero', 'Complete a flossing session', '🦷', 20, 'floss', 1),
('Super Brusher', 'Brush your teeth twice today', '⭐', 25, 'brush', 2);