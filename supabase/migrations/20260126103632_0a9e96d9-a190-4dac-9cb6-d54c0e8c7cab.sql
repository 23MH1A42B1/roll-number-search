-- Add explicit INSERT and DELETE deny policies for defense-in-depth
CREATE POLICY "Deny all inserts to visit count"
ON public.site_visits
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Deny all deletes to visit count"
ON public.site_visits
FOR DELETE
USING (false);