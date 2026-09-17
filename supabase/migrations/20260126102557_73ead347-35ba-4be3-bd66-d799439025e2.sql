-- Create a table to store the global site visit counter
CREATE TABLE public.site_visits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the visit count (public counter)
CREATE POLICY "Anyone can view visit count" 
ON public.site_visits 
FOR SELECT 
USING (true);

-- Allow anyone to update the visit count (for incrementing)
CREATE POLICY "Anyone can update visit count" 
ON public.site_visits 
FOR UPDATE 
USING (true);

-- Insert the initial counter row
INSERT INTO public.site_visits (visit_count) VALUES (0);

-- Create function to increment visit count
CREATE OR REPLACE FUNCTION public.increment_visit_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE public.site_visits 
    SET visit_count = visit_count + 1, updated_at = now()
    WHERE id = (SELECT id FROM public.site_visits LIMIT 1)
    RETURNING visit_count INTO new_count;
    
    RETURN new_count;
END;
$$;