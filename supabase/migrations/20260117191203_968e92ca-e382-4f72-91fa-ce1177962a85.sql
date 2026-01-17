-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('parent', 'child');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  avatar_emoji TEXT DEFAULT '🦷',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create children table (children linked to parent accounts)
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  avatar_emoji TEXT DEFAULT '🦷',
  birth_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create badges table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT NOT NULL,
  xp_required INTEGER NOT NULL DEFAULT 0,
  quest_count_required INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quest_progress table
CREATE TABLE public.quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  quest_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  xp_earned INTEGER NOT NULL DEFAULT 10,
  UNIQUE (child_id, quest_id)
);

-- Create earned_badges table
CREATE TABLE public.earned_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (child_id, badge_id)
);

-- Create brushing_sessions table for tracking daily brushing
CREATE TABLE public.brushing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  duration_seconds INTEGER NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'morning',
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earned_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brushing_sessions ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for children
CREATE POLICY "Parents can view their children"
  ON public.children FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert children"
  ON public.children FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update their children"
  ON public.children FOR UPDATE
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete their children"
  ON public.children FOR DELETE
  USING (auth.uid() = parent_id);

-- RLS Policies for badges (public read)
CREATE POLICY "Anyone can view badges"
  ON public.badges FOR SELECT
  USING (true);

-- RLS Policies for quest_progress
CREATE POLICY "Parents can view children quest progress"
  ON public.quest_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = quest_progress.child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert children quest progress"
  ON public.quest_progress FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = quest_progress.child_id
      AND children.parent_id = auth.uid()
    )
  );

-- RLS Policies for earned_badges
CREATE POLICY "Parents can view children earned badges"
  ON public.earned_badges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = earned_badges.child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert children earned badges"
  ON public.earned_badges FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = earned_badges.child_id
      AND children.parent_id = auth.uid()
    )
  );

-- RLS Policies for brushing_sessions
CREATE POLICY "Parents can view children brushing sessions"
  ON public.brushing_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = brushing_sessions.child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert children brushing sessions"
  ON public.brushing_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = brushing_sessions.child_id
      AND children.parent_id = auth.uid()
    )
  );

-- Insert default badges
INSERT INTO public.badges (name, description, emoji, xp_required, quest_count_required) VALUES
  ('First Quest', 'Complete your first quest!', '⭐', 0, 1),
  ('Story Explorer', 'Complete 5 quests', '📚', 50, 5),
  ('Brushing Beginner', 'Earn 100 XP', '🪥', 100, 0),
  ('Quest Champion', 'Complete 10 quests', '🏆', 100, 10),
  ('Dental Defender', 'Earn 250 XP', '🛡️', 250, 0),
  ('Super Brusher', 'Complete 15 quests', '💪', 150, 15),
  ('Smile Master', 'Earn 500 XP', '😁', 500, 0),
  ('Quest Legend', 'Complete all 30 quests', '👑', 300, 30);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get child's total XP
CREATE OR REPLACE FUNCTION public.get_child_total_xp(child_uuid UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(xp_earned), 0)::INTEGER
  FROM public.quest_progress
  WHERE child_id = child_uuid
$$;