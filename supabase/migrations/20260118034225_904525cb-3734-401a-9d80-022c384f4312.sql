-- Harden analytics_events to avoid storing session-like identifiers and prevent PII in event_data

-- 1) Remove forbidden FK reference to auth.users (we store user_id as a plain UUID instead)
ALTER TABLE public.analytics_events
  DROP CONSTRAINT IF EXISTS analytics_events_user_id_fkey;

-- 2) Remove session_id column (minimize behavioral/session tracking data)
ALTER TABLE public.analytics_events
  DROP COLUMN IF EXISTS session_id;

-- 3) Remove user self-SELECT policy (only admins can read analytics)
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.analytics_events;

-- 4) Add server-side validation + sanitization on insert
CREATE OR REPLACE FUNCTION public.validate_analytics_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Normalize + validate event_name
  NEW.event_name := lower(trim(NEW.event_name));

  IF NEW.event_name IS NULL OR NEW.event_name = '' THEN
    RAISE EXCEPTION 'event_name required';
  END IF;

  IF length(NEW.event_name) > 64 THEN
    RAISE EXCEPTION 'event_name too long';
  END IF;

  IF NEW.event_name !~ '^[a-z0-9_:-]+$' THEN
    RAISE EXCEPTION 'event_name invalid';
  END IF;

  -- Normalize page_path (optional)
  IF NEW.page_path IS NOT NULL THEN
    NEW.page_path := left(trim(NEW.page_path), 200);
    IF NEW.page_path !~ '^/' THEN
      NEW.page_path := '/' || NEW.page_path;
    END IF;
  END IF;

  -- Sanitize event_data
  IF NEW.event_data IS NULL THEN
    NEW.event_data := '{}'::jsonb;
  END IF;

  IF jsonb_typeof(NEW.event_data) <> 'object' THEN
    NEW.event_data := '{}'::jsonb;
  END IF;

  -- Strip common PII/sensitive keys (case-sensitive keys are removed by common variants)
  NEW.event_data := NEW.event_data
    - 'email' - 'Email' - 'EMAIL'
    - 'password' - 'Password' - 'PASSWORD'
    - 'pass' - 'Pass'
    - 'token' - 'Token' - 'access_token' - 'refresh_token'
    - 'phone' - 'Phone'
    - 'address' - 'Address'
    - 'ip' - 'IP' - 'ip_address' - 'IpAddress';

  -- Cap payload size (~8KB)
  IF pg_column_size(NEW.event_data) > 8192 THEN
    RAISE EXCEPTION 'event_data too large';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_analytics_events_before_insert ON public.analytics_events;
CREATE TRIGGER validate_analytics_events_before_insert
BEFORE INSERT ON public.analytics_events
FOR EACH ROW
EXECUTE FUNCTION public.validate_analytics_events();
