-- Grant SELECT privileges on public content tables to both anon and authenticated roles
-- These are needed for Guest Mode and authenticated users to read badges, challenges, and achievements

GRANT SELECT ON public.badges TO anon;
GRANT SELECT ON public.badges TO authenticated;

GRANT SELECT ON public.daily_challenges TO anon;
GRANT SELECT ON public.daily_challenges TO authenticated;

GRANT SELECT ON public.game_achievements TO anon;
GRANT SELECT ON public.game_achievements TO authenticated;