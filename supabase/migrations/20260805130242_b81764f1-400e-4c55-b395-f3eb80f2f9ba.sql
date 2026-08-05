CREATE TABLE public.data_corrections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    wilaya_code int NOT NULL,
    daira_name text NOT NULL,
    commune_name text NOT NULL,
    zip_code text,
    village_name text,
    user_message text,
    language_submitted text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now()
);

GRANT INSERT ON public.data_corrections TO anon, authenticated;
GRANT ALL ON public.data_corrections TO service_role;
GRANT SELECT ON public.data_corrections TO authenticated;

ALTER TABLE public.data_corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts on data_corrections"
ON public.data_corrections
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated selects on data_corrections"
ON public.data_corrections
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow service_role full access on data_corrections"
ON public.data_corrections
FOR ALL
TO service_role
USING (true);
