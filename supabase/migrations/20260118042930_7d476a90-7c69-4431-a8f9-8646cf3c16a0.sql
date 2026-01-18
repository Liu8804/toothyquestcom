-- Attach server-side validation to analytics_events (was missing)
DROP TRIGGER IF EXISTS analytics_events_validate_insert ON public.analytics_events;
DROP TRIGGER IF EXISTS analytics_events_validate_update ON public.analytics_events;

CREATE TRIGGER analytics_events_validate_insert
  BEFORE INSERT ON public.analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_analytics_events();

CREATE TRIGGER analytics_events_validate_update
  BEFORE UPDATE ON public.analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_analytics_events();