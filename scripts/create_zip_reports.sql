CREATE TABLE IF NOT EXISTS public.zip_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zip_code TEXT NOT NULL,
    wilaya_code INTEGER NOT NULL,
    daira_name TEXT NOT NULL,
    commune_name TEXT NOT NULL,
    village_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.zip_reports TO authenticated;
GRANT ALL ON public.zip_reports TO service_role;
GRANT SELECT, INSERT ON public.zip_reports TO anon;

ALTER TABLE public.zip_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON public.zip_reports FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous selects" ON public.zip_reports FOR SELECT TO anon USING (true);
CREATE POLICY "Admins can do everything" ON public.zip_reports FOR ALL TO authenticated USING (true);
