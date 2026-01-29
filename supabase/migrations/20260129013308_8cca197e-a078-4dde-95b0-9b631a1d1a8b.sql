-- Allow guests (anon) to read non-sensitive content needed for Guest Mode / home screen

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_achievements ENABLE ROW LEVEL SECURITY;

-- Badges (public)
DROP POLICY IF EXISTS "Public can view badges" ON public.badges;
CREATE POLICY "Public can view badges"
ON public.badges
FOR SELECT
TO anon, authenticated
USING (true);

-- Daily challenges (public)
DROP POLICY IF EXISTS "Public can view daily challenges" ON public.daily_challenges;
CREATE POLICY "Public can view daily challenges"
ON public.daily_challenges
FOR SELECT
TO anon, authenticated
USING (true);

-- Game achievements (public)
DROP POLICY IF EXISTS "Public can view game achievements" ON public.game_achievements;
CREATE POLICY "Public can view game achievements"
ON public.game_achievements
FOR SELECT
TO anon, authenticated
USING (true);
