-- Increment the public counter without relying on anonymous table update access.
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
    SET visit_count = visit_count + 1,
        updated_at = now()
    WHERE id = (SELECT id FROM public.site_visits ORDER BY created_at LIMIT 1)
    RETURNING visit_count INTO new_count;

    RETURN new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_visit_count() TO anon, authenticated;