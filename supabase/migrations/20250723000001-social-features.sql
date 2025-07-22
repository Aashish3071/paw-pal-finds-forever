-- FOLLOWS TABLE for user following system
CREATE TABLE public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references public.users(id) on delete cascade,
  following_id uuid references public.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id) -- Prevent self-following
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for follows
CREATE POLICY "Users can view follows"
ON public.follows FOR SELECT
USING (true);

CREATE POLICY "Users can create their own follows"
ON public.follows FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
ON public.follows FOR DELETE
USING (auth.uid() = follower_id);

-- Add indexes for performance
CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);

-- Enhanced comments with better structure (if not already optimal)
-- The existing comments table should be sufficient, but let's add an index
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at);

-- Function to get follower count
CREATE OR REPLACE FUNCTION get_follower_count(user_uuid uuid)
RETURNS bigint AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.follows
    WHERE following_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get following count
CREATE OR REPLACE FUNCTION get_following_count(user_uuid uuid)
RETURNS bigint AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.follows
    WHERE follower_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is following another user
CREATE OR REPLACE FUNCTION is_following(follower_uuid uuid, following_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.follows
    WHERE follower_id = follower_uuid AND following_id = following_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 