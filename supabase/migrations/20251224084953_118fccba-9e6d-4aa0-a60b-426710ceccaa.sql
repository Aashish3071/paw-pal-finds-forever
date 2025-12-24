-- Fix PUBLIC_DATA_EXPOSURE: Care requests location publicly exposed
-- Update RLS policy to require authentication for viewing care requests

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view open care requests" ON public.care_requests;

-- Create new policy requiring authentication
CREATE POLICY "Authenticated users can view open care requests" 
ON public.care_requests FOR SELECT 
USING (auth.uid() IS NOT NULL AND status = 'open');