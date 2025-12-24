-- Fix PUBLIC_DATA_EXPOSURE: User profiles publicly readable without authentication
-- Update RLS policy to require authentication for viewing user profiles

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;

-- Create new policy requiring authentication to view profiles
CREATE POLICY "Authenticated users can view profiles" 
ON public.users FOR SELECT 
USING (auth.uid() IS NOT NULL);