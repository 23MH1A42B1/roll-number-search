-- Fix: Change SECURITY DEFINER to SECURITY INVOKER for increment_visit_count function
CREATE OR REPLACE FUNCTION public.increment_visit_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
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