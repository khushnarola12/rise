-- Create settings table for storing app configuration
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow superusers to read/write settings
CREATE POLICY "Superusers can manage settings" ON public.settings
  FOR ALL USING (true);

-- Insert default revenue rate
INSERT INTO public.settings (key, value) 
VALUES ('revenue_per_admin', '12000')
ON CONFLICT (key) DO NOTHING;
