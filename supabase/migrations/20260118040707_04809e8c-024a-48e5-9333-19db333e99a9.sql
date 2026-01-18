-- Strengthen analytics validation trigger to only allow specific whitelisted keys
CREATE OR REPLACE FUNCTION public.validate_analytics_events()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  allowed_keys text[] := ARRAY['button_name', 'feature_name', 'game_id', 'story_id', 
    'badge_id', 'badge_name', 'child_id', 'duration', 'session_type', 'score', 
    'quest_id', 'challenge_id'];
  key text;
  filtered_data jsonb := '{}'::jsonb;
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

  -- Strict allowlist for event_data keys - only allow predefined safe keys
  IF NEW.event_data IS NULL THEN
    NEW.event_data := '{}'::jsonb;
  END IF;

  IF jsonb_typeof(NEW.event_data) <> 'object' THEN
    NEW.event_data := '{}'::jsonb;
  ELSE
    -- Only keep allowed keys with primitive values
    FOR key IN SELECT jsonb_object_keys(NEW.event_data)
    LOOP
      IF key = ANY(allowed_keys) THEN
        -- Only allow primitive types (string, number, boolean, null)
        IF jsonb_typeof(NEW.event_data->key) IN ('string', 'number', 'boolean', 'null') THEN
          -- Truncate strings to 100 chars
          IF jsonb_typeof(NEW.event_data->key) = 'string' THEN
            filtered_data := filtered_data || jsonb_build_object(key, left((NEW.event_data->>key), 100));
          ELSE
            filtered_data := filtered_data || jsonb_build_object(key, NEW.event_data->key);
          END IF;
        END IF;
      END IF;
    END LOOP;
    NEW.event_data := filtered_data;
  END IF;

  -- Cap payload size (~2KB max for filtered data)
  IF pg_column_size(NEW.event_data) > 2048 THEN
    RAISE EXCEPTION 'event_data too large';
  END IF;

  RETURN NEW;
END;
$$;