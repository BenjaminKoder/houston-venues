CREATE TABLE public.venues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  venue_group TEXT,
  category TEXT,
  neighborhood TEXT,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  coords_approximate BOOLEAN NOT NULL DEFAULT false,
  google_rating NUMERIC,
  price_proposed TEXT,
  price_online TEXT,
  price_note TEXT DEFAULT '',
  impression TEXT DEFAULT '',
  use_case TEXT DEFAULT '',
  status TEXT DEFAULT '',
  amenities TEXT[] NOT NULL DEFAULT '{}',
  website TEXT,
  image_url TEXT,
  image_verified BOOLEAN NOT NULL DEFAULT false,
  source TEXT DEFAULT '',
  verified BOOLEAN NOT NULL DEFAULT false,
  notes TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  price TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.venues TO anon, authenticated;
GRANT ALL ON public.venues TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendors TO anon, authenticated;
GRANT ALL ON public.vendors TO service_role;

ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read venues" ON public.venues FOR SELECT USING (true);
CREATE POLICY "Public can insert venues" ON public.venues FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update venues" ON public.venues FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete venues" ON public.venues FOR DELETE USING (true);

CREATE POLICY "Public can read vendors" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Public can insert vendors" ON public.vendors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update vendors" ON public.vendors FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete vendors" ON public.vendors FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();