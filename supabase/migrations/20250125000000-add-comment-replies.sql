-- Add reply functionality to comments table
ALTER TABLE public.comments 
ADD COLUMN parent_id uuid references public.comments(id) on delete cascade;

-- Add reply_to_user_id to track which user the reply is addressing
ALTER TABLE public.comments 
ADD COLUMN reply_to_user_id uuid references public.users(id) on delete set null;

-- Add index for performance
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);

-- Update RLS policies to handle replies
-- The existing policies should work for replies as well since they're still comments

-- Add a function to get comment reply count
CREATE OR REPLACE FUNCTION get_reply_count(comment_uuid uuid)
RETURNS bigint AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.comments
    WHERE parent_id = comment_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a recursive function to get comment threads
CREATE OR REPLACE FUNCTION get_comment_thread(comment_uuid uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  post_id uuid,
  parent_id uuid,
  reply_to_user_id uuid,
  content text,
  created_at timestamp with time zone,
  level integer
) AS $$
WITH RECURSIVE comment_tree AS (
  -- Base case: top-level comment
  SELECT 
    c.id,
    c.user_id,
    c.post_id,
    c.parent_id,
    c.reply_to_user_id,
    c.content,
    c.created_at,
    0 as level
  FROM public.comments c
  WHERE c.id = comment_uuid
  
  UNION ALL
  
  -- Recursive case: replies to this comment
  SELECT 
    c.id,
    c.user_id,
    c.post_id,
    c.parent_id,
    c.reply_to_user_id,
    c.content,
    c.created_at,
    ct.level + 1
  FROM public.comments c
  JOIN comment_tree ct ON c.parent_id = ct.id
)
SELECT * FROM comment_tree
ORDER BY level, created_at;
$$ LANGUAGE sql SECURITY DEFINER;