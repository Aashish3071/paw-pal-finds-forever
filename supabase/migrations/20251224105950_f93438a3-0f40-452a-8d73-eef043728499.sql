-- Fix MISSING_RLS: Add UPDATE policy for comments table
-- Allow users to update their own comments

CREATE POLICY "Users can update their own comments" 
ON public.comments FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);