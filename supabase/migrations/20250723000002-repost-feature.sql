-- Add repost functionality to posts
-- This migration adds support for reposts/retweets

-- Add repost columns to posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_repost boolean DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS original_post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS repost_comment text; -- Optional comment when reposting

-- Create reposts tracking table for analytics
CREATE TABLE IF NOT EXISTS public.reposts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  original_post_id uuid references public.posts(id) on delete cascade,
  repost_comment text,
  created_at timestamp with time zone default now(),
  UNIQUE(user_id, original_post_id) -- Prevent duplicate reposts by same user
);

-- Add RLS policies for reposts table
ALTER TABLE public.reposts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all reposts" ON public.reposts
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own reposts" ON public.reposts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reposts" ON public.reposts
  FOR DELETE USING (auth.uid() = user_id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_reposts_user_id ON public.reposts(user_id);
CREATE INDEX IF NOT EXISTS idx_reposts_post_id ON public.reposts(post_id);
CREATE INDEX IF NOT EXISTS idx_reposts_original_post_id ON public.reposts(original_post_id);

-- Add index for posts repost queries
CREATE INDEX IF NOT EXISTS idx_posts_original_post_id ON public.posts(original_post_id);
CREATE INDEX IF NOT EXISTS idx_posts_is_repost ON public.posts(is_repost);

-- Function to get repost count for a post
CREATE OR REPLACE FUNCTION get_repost_count(post_uuid uuid)
RETURNS bigint
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)
  FROM public.reposts
  WHERE original_post_id = post_uuid;
$$;

-- Function to check if user has reposted a post
CREATE OR REPLACE FUNCTION has_user_reposted(user_uuid uuid, post_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.reposts
    WHERE user_id = user_uuid AND original_post_id = post_uuid
  );
$$;

-- Update the posts view to include repost count
-- Note: This would typically be done in application code for better performance 