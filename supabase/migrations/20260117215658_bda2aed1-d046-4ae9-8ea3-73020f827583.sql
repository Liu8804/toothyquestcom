-- Create game_scores table for leaderboards
CREATE TABLE public.game_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  stars_earned INTEGER NOT NULL DEFAULT 0,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create game_achievements table
CREATE TABLE public.game_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT NOT NULL,
  game_id TEXT, -- NULL means global achievement
  requirement_type TEXT NOT NULL, -- 'games_played', 'total_stars', 'high_score', 'all_games', 'streak'
  requirement_value INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create earned_achievements table
CREATE TABLE public.earned_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.game_achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(child_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earned_achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for game_scores
CREATE POLICY "Users can view their children's scores" ON public.game_scores
  FOR SELECT USING (
    child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
  );

CREATE POLICY "Users can insert scores for their children" ON public.game_scores
  FOR INSERT WITH CHECK (
    child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
  );

-- RLS policies for game_achievements (readable by all authenticated)
CREATE POLICY "Anyone can view achievements" ON public.game_achievements
  FOR SELECT USING (true);

-- RLS policies for earned_achievements
CREATE POLICY "Users can view their children's earned achievements" ON public.earned_achievements
  FOR SELECT USING (
    child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
  );

CREATE POLICY "Users can insert achievements for their children" ON public.earned_achievements
  FOR INSERT WITH CHECK (
    child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
  );

-- Insert default achievements
INSERT INTO public.game_achievements (name, description, emoji, game_id, requirement_type, requirement_value) VALUES
  ('First Steps', 'Play your first game!', '🎮', NULL, 'games_played', 1),
  ('Game Explorer', 'Play 5 different games', '🌟', NULL, 'games_played', 5),
  ('Star Collector', 'Earn 10 stars total', '⭐', NULL, 'total_stars', 10),
  ('Star Champion', 'Earn 50 stars total', '🌠', NULL, 'total_stars', 50),
  ('Game Master', 'Play all 6 games', '👑', NULL, 'all_games', 6),
  ('Plaque Patrol Pro', 'Get a perfect score in Plaque Patrol', '🦷', 'plaque_patrol', 'high_score', 15),
  ('Tooth Defender Hero', 'Catch 15 healthy items in Tooth Defender', '🛡️', 'tooth_defender', 'high_score', 15),
  ('Floss Master', 'Complete Floss Hero with all gaps', '🧵', 'floss_hero', 'high_score', 5),
  ('Bug Buster', 'Stop all sugar bugs in Sugar Bug Chase', '🐛', 'sugar_bug_chase', 'high_score', 20),
  ('Smile Artist', 'Build a perfect healthy smile', '😁', 'build_a_smile', 'high_score', 3),
  ('Memory Champion', 'Complete Quest Match in under 10 moves', '🃏', 'quest_match', 'high_score', 10);

-- Create index for faster leaderboard queries
CREATE INDEX idx_game_scores_game_id ON public.game_scores(game_id);
CREATE INDEX idx_game_scores_score ON public.game_scores(score DESC);
CREATE INDEX idx_game_scores_child_game ON public.game_scores(child_id, game_id);