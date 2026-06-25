-- Tighten write access on venues and vendors so it is no longer wide-open
-- (USING (true) / WITH CHECK (true)). Public read stays open; create/edit/delete
-- now require an authenticated user.

-- venues
DROP POLICY IF EXISTS "Public can insert venues" ON public.venues;
DROP POLICY IF EXISTS "Public can update venues" ON public.venues;
DROP POLICY IF EXISTS "Public can delete venues" ON public.venues;

CREATE POLICY "Authenticated can insert venues"
  ON public.venues FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update venues"
  ON public.venues FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete venues"
  ON public.venues FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- vendors
DROP POLICY IF EXISTS "Public can insert vendors" ON public.vendors;
DROP POLICY IF EXISTS "Public can update vendors" ON public.vendors;
DROP POLICY IF EXISTS "Public can delete vendors" ON public.vendors;

CREATE POLICY "Authenticated can insert vendors"
  ON public.vendors FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update vendors"
  ON public.vendors FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete vendors"
  ON public.vendors FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);