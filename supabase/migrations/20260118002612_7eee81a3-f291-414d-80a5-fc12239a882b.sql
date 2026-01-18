-- Add admin-only write policies for game configuration tables

-- game_achievements: Add admin-only INSERT, UPDATE, DELETE policies
CREATE POLICY "Only admins can insert game achievements"
ON public.game_achievements
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update game achievements"
ON public.game_achievements
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete game achievements"
ON public.game_achievements
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- daily_challenges: Add admin-only INSERT, UPDATE, DELETE policies
CREATE POLICY "Only admins can insert daily challenges"
ON public.daily_challenges
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update daily challenges"
ON public.daily_challenges
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete daily challenges"
ON public.daily_challenges
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));