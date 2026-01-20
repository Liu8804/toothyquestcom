-- Satisfy linter: keep unlock_codes locked down with explicit deny policies

DO $$ BEGIN
  -- SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'unlock_codes' AND policyname = 'Deny all select on unlock codes'
  ) THEN
    CREATE POLICY "Deny all select on unlock codes"
    ON public.unlock_codes
    FOR SELECT
    USING (false);
  END IF;

  -- INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'unlock_codes' AND policyname = 'Deny all insert on unlock codes'
  ) THEN
    CREATE POLICY "Deny all insert on unlock codes"
    ON public.unlock_codes
    FOR INSERT
    WITH CHECK (false);
  END IF;

  -- UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'unlock_codes' AND policyname = 'Deny all update on unlock codes'
  ) THEN
    CREATE POLICY "Deny all update on unlock codes"
    ON public.unlock_codes
    FOR UPDATE
    USING (false)
    WITH CHECK (false);
  END IF;

  -- DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'unlock_codes' AND policyname = 'Deny all delete on unlock codes'
  ) THEN
    CREATE POLICY "Deny all delete on unlock codes"
    ON public.unlock_codes
    FOR DELETE
    USING (false);
  END IF;
END $$;
