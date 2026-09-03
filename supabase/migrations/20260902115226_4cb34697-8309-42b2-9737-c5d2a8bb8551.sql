CREATE TABLE public.vendre_setup_progress (
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

INSERT INTO public.vendre_setup_progress (id) VALUES (1);

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

CREATE TRIGGER update_vendre_setup_progress_updated_at
BEFORE UPDATE ON public.vendre_setup_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_vendre_setup_progress_updated_at();