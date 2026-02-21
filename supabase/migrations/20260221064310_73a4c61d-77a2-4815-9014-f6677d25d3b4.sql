
-- Create dental_clinics table
CREATE TABLE public.dental_clinics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  hours JSONB DEFAULT '{}'::jsonb,
  services TEXT[] DEFAULT '{}',
  welcome_message TEXT DEFAULT 'Welcome to our clinic! Toothy says: Keep brushing those teeth! 🦷',
  kid_tip TEXT DEFAULT 'Brush your teeth twice a day for a super sparkly smile! ✨',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_clinic_selections (favorites)
CREATE TABLE public.user_clinic_selections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  clinic_id UUID NOT NULL REFERENCES public.dental_clinics(id) ON DELETE CASCADE,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, clinic_id)
);

-- Enable RLS
ALTER TABLE public.dental_clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_clinic_selections ENABLE ROW LEVEL SECURITY;

-- dental_clinics policies: anyone authenticated can view active clinics, admins manage
CREATE POLICY "Anyone can view active clinics"
ON public.dental_clinics FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can insert clinics"
ON public.dental_clinics FOR INSERT
WITH CHECK (public.current_user_has_role('admin'::app_role));

CREATE POLICY "Admins can update clinics"
ON public.dental_clinics FOR UPDATE
USING (public.current_user_has_role('admin'::app_role));

CREATE POLICY "Admins can delete clinics"
ON public.dental_clinics FOR DELETE
USING (public.current_user_has_role('admin'::app_role));

CREATE POLICY "Admins can view all clinics"
ON public.dental_clinics FOR SELECT
USING (public.current_user_has_role('admin'::app_role));

-- user_clinic_selections policies
CREATE POLICY "deny_anonymous_access"
ON public.user_clinic_selections FOR ALL
USING (false);

CREATE POLICY "Users can view own selections"
ON public.user_clinic_selections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own selections"
ON public.user_clinic_selections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own selections"
ON public.user_clinic_selections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own selections"
ON public.user_clinic_selections FOR DELETE
USING (auth.uid() = user_id);

-- Storage bucket for clinic logos
INSERT INTO storage.buckets (id, name, public) VALUES ('clinic-logos', 'clinic-logos', true);

CREATE POLICY "Anyone can view clinic logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'clinic-logos');

CREATE POLICY "Admins can upload clinic logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'clinic-logos' AND public.current_user_has_role('admin'::app_role));

CREATE POLICY "Admins can update clinic logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'clinic-logos' AND public.current_user_has_role('admin'::app_role));

CREATE POLICY "Admins can delete clinic logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'clinic-logos' AND public.current_user_has_role('admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_dental_clinics_updated_at
BEFORE UPDATE ON public.dental_clinics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
