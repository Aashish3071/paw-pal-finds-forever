-- Fix security warnings by adding search_path to all functions

-- Fix get_next_thread_path function
CREATE OR REPLACE FUNCTION get_next_thread_path(parent_comment_id uuid, target_post_id uuid)
RETURNS text AS $$
DECLARE
  parent_path text;
  next_number integer;
BEGIN
  IF parent_comment_id IS NULL THEN
    -- Top-level comment: get next number in sequence
    SELECT COALESCE(MAX(CAST(thread_path AS integer)), 0) + 1
    INTO next_number
    FROM public.comments 
    WHERE post_id = target_post_id AND parent_id IS NULL AND thread_path ~ '^[0-9]+$';
    
    RETURN next_number::text;
  ELSE
    -- Reply: get parent path and append next number
    SELECT thread_path INTO parent_path
    FROM public.comments 
    WHERE id = parent_comment_id;
    
    IF parent_path IS NULL THEN
      RETURN '1.1'; -- Fallback if parent has no path
    END IF;
    
    -- Get next number for this parent's replies
    SELECT COALESCE(MAX(
      CAST(
        SPLIT_PART(
          SUBSTRING(thread_path FROM LENGTH(parent_path) + 2), 
          '.', 
          1
        ) AS integer
      )
    ), 0) + 1
    INTO next_number
    FROM public.comments 
    WHERE parent_id = parent_comment_id AND thread_path LIKE parent_path || '.%';
    
    RETURN parent_path || '.' || next_number::text;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix get_thread_level function
CREATE OR REPLACE FUNCTION get_thread_level(parent_comment_id uuid)
RETURNS integer AS $$
BEGIN
  IF parent_comment_id IS NULL THEN
    RETURN 0;
  ELSE
    RETURN (
      SELECT COALESCE(thread_level + 1, 1)
      FROM public.comments
      WHERE id = parent_comment_id
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix set_comment_thread_info function
CREATE OR REPLACE FUNCTION set_comment_thread_info()
RETURNS trigger AS $$
BEGIN
  -- Set thread_level
  NEW.thread_level := public.get_thread_level(NEW.parent_id);
  
  -- Set thread_path
  NEW.thread_path := public.get_next_thread_path(NEW.parent_id, NEW.post_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Fix get_post_comment_tree function
CREATE OR REPLACE FUNCTION get_post_comment_tree(target_post_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  post_id uuid,
  parent_id uuid,
  reply_to_user_id uuid,
  content text,
  created_at timestamp with time zone,
  thread_level integer,
  thread_path text,
  user_name text,
  user_avatar_url text,
  reply_to_user_name text,
  reply_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.user_id,
    c.post_id,
    c.parent_id,
    c.reply_to_user_id,
    c.content,
    c.created_at,
    c.thread_level,
    c.thread_path,
    u.name as user_name,
    u.avatar_url as user_avatar_url,
    ru.name as reply_to_user_name,
    (SELECT COUNT(*) FROM public.comments WHERE parent_id = c.id) as reply_count
  FROM public.comments c
  LEFT JOIN public.users u ON c.user_id = u.id
  LEFT JOIN public.users ru ON c.reply_to_user_id = ru.id
  WHERE c.post_id = target_post_id
  ORDER BY 
    -- Custom ordering to maintain thread hierarchy
    CASE 
      WHEN c.thread_path ~ '^[0-9]+$' THEN 
        -- Top-level comments: sort by thread_path as integer
        LPAD(c.thread_path, 10, '0')
      ELSE 
        -- Nested comments: sort by full path
        REGEXP_REPLACE(
          c.thread_path, 
          '([0-9]+)', 
          LPAD('\1', 5, '0'), 
          'g'
        )
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix get_reply_count function
CREATE OR REPLACE FUNCTION get_reply_count(comment_uuid uuid)
RETURNS bigint AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.comments
    WHERE parent_id = comment_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix existing functions with search_path
CREATE OR REPLACE FUNCTION public.get_follower_count(user_uuid uuid)
RETURNS bigint AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.follows
    WHERE following_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.get_following_count(user_uuid uuid)
RETURNS bigint AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.follows
    WHERE follower_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.is_following(follower_uuid uuid, following_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.follows
    WHERE follower_id = follower_uuid AND following_id = following_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.get_repost_count(post_uuid uuid)
RETURNS bigint AS $$
  SELECT COUNT(*)
  FROM public.reposts
  WHERE original_post_id = post_uuid;
$$ LANGUAGE sql STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.has_user_reposted(user_uuid uuid, post_uuid uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.reposts
    WHERE user_id = user_uuid AND original_post_id = post_uuid
  );
$$ LANGUAGE sql STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';