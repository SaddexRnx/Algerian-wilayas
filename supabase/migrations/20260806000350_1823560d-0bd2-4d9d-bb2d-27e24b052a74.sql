DROP TABLE IF EXISTS public.site_stats;
CREATE TABLE public.site_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_api_calls BIGINT NOT NULL DEFAULT 15420,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
GRANT SELECT, INSERT, UPDATE ON public.site_stats TO anon, authenticated;
GRANT ALL ON public.site_stats TO service_role;
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.site_stats FOR SELECT TO public USING (true);
CREATE POLICY "Allow public update access" ON public.site_stats FOR UPDATE TO public USING (true);
INSERT INTO public.site_stats (total_api_calls) VALUES (15420);

CREATE OR REPLACE FUNCTION public.increment_api_calls()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.site_stats SET total_api_calls = total_api_calls + 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_api_calls() TO anon, authenticated;

GRANT SELECT, UPDATE, DELETE ON public.data_corrections TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.zip_reports TO authenticated;
DROP POLICY IF EXISTS "Admins can manage corrections" ON public.data_corrections;
CREATE POLICY "Admins can manage corrections" ON public.data_corrections FOR ALL TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can manage reports" ON public.zip_reports;
CREATE POLICY "Admins can manage reports" ON public.zip_reports FOR ALL TO authenticated USING (true);
GRANT ALL ON public.data_corrections TO authenticated;
GRANT ALL ON public.zip_reports TO authenticated;
