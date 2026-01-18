-- Attach the validation trigger to analytics_events table
DROP TRIGGER IF EXISTS validate_analytics_events_trigger ON public.analytics_events;

CREATE TRIGGER validate_analytics_events_trigger
  BEFORE INSERT ON public.analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_analytics_events();