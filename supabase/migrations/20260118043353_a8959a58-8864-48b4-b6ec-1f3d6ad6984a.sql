-- Make analytics event_data validation visible to scanners by enforcing it in RLS WITH CHECK
-- (Triggers may not appear in information_schema.triggers without table privileges)

-- 1) Helper validation function (does not touch tables; safe to call from RLS)
CREATE OR REPLACE FUNCTION public.is_safe_analytics_event_data(_data jsonb)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN _data IS NULL THEN true
      WHEN jsonb_typeof(_data) <> 'object' THEN false
      WHEN pg_column_size(_data) > 2048 THEN false
      ELSE NOT EXISTS (
        SELECT 1
        FROM jsonb_object_keys(_data) AS k(key)
        WHERE
          -- allowlist keys only
          k.key <> ALL(ARRAY[
            'button_name','feature_name','game_id','story_id','badge_id','badge_name',
            'child_id','duration','session_type','score','quest_id','challenge_id'
          ]::text[])
          OR jsonb_typeof(_data -> k.key) NOT IN ('string','number','boolean','null')
          OR (
            jsonb_typeof(_data -> k.key) = 'string'
            AND length(_data ->> k.key) > 100
          )
      )
    END;
$$;

-- 2) Tighten INSERT policy to require safe event_data
DROP POLICY IF EXISTS "Users can insert their own analytics events" ON public.analytics_events;

CREATE POLICY "Users can insert their own analytics events"
ON public.analytics_events
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND auth.uid() = user_id
  AND public.is_safe_analytics_event_data(event_data)
);

-- 3) De-duplicate triggers and keep a single trigger for INSERT/UPDATE
DROP TRIGGER IF EXISTS analytics_events_validate_insert ON public.analytics_events;
DROP TRIGGER IF EXISTS analytics_events_validate_update ON public.analytics_events;
DROP TRIGGER IF EXISTS validate_analytics_events_before_insert ON public.analytics_events;
DROP TRIGGER IF EXISTS validate_analytics_events_trigger ON public.analytics_events;

CREATE TRIGGER validate_analytics_events_trigger
  BEFORE INSERT OR UPDATE ON public.analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_analytics_events();