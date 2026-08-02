CREATE TABLE public.api_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint text NOT NULL,
  status integer NOT NULL DEFAULT 200,
  response_time_ms integer NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'demo',
  session_id text,
  wilaya_code integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX api_logs_created_at_idx ON public.api_logs (created_at DESC);
CREATE INDEX api_logs_endpoint_idx ON public.api_logs (endpoint);

GRANT INSERT ON public.api_logs TO anon;
GRANT INSERT ON public.api_logs TO authenticated;
GRANT ALL ON public.api_logs TO service_role;

ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record an api usage entry"
  ON public.api_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(endpoint) <= 300
    AND length(coalesce(source, '')) <= 40
    AND length(coalesce(session_id, '')) <= 64
    AND status BETWEEN 0 AND 599
    AND response_time_ms BETWEEN 0 AND 600000
  );