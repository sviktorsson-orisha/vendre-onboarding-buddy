CREATE POLICY "Service role manages setup progress"
ON public.vendre_setup_progress
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);