CREATE TABLE IF NOT EXISTS public.vendre_setup_progress (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  admin_done BOOLEAN NOT NULL DEFAULT FALSE,
  cors_done BOOLEAN NOT NULL DEFAULT FALSE,
  secrets_ok BOOLEAN NOT NULL DEFAULT FALSE,
  connection_ok BOOLEAN NOT NULL DEFAULT FALSE,
  published_origin TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.vendre_setup_progress TO service_role;

ALTER TABLE public.vendre_setup_progress ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'vendre_setup_progress'
      AND policyname = 'Service role manages setup progress'
  ) THEN
    CREATE POLICY "Service role manages setup progress"
      ON public.vendre_setup_progress
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.update_vendre_setup_progress_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_vendre_setup_progress_updated_at ON public.vendre_setup_progress;
CREATE TRIGGER update_vendre_setup_progress_updated_at
BEFORE UPDATE ON public.vendre_setup_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_vendre_setup_progress_updated_at();

INSERT INTO public.vendre_setup_progress (id) VALUES (1) ON CONFLICT (id) DO NOTHING;