-- ==========================================
-- PAWPAL TWITTER-STYLE COMMENT THREADING SYSTEM
-- Complete setup for unlimited nested comments
-- ==========================================

-- Step 1: Add basic reply functionality (if not exists)
DO $$ 
BEGIN
    -- Add parent_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' 
        AND column_name = 'parent_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.comments 
        ADD COLUMN parent_id uuid references public.comments(id) on delete cascade;
        RAISE NOTICE 'Added parent_id column';
    END IF;

    -- Add reply_to_user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' 
        AND column_name = 'reply_to_user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.comments 
        ADD COLUMN reply_to_user_id uuid references public.users(id) on delete set null;
        RAISE NOTICE 'Added reply_to_user_id column';
    END IF;
END $$;

-- Step 2: Add advanced threading columns
DO $$ 
BEGIN
    -- Add thread_level column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' 
        AND column_name = 'thread_level'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.comments 
        ADD COLUMN thread_level integer DEFAULT 0 NOT NULL;
        RAISE NOTICE 'Added thread_level column';
    END IF;

    -- Add thread_path column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' 
        AND column_name = 'thread_path'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.comments 
        ADD COLUMN thread_path text;
        RAISE NOTICE 'Added thread_path column';
    END IF;
END $$;

-- Step 3: Create performance indexes
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_thread_level ON public.comments(thread_level);
CREATE INDEX IF NOT EXISTS idx_comments_thread_path ON public.comments(thread_path);
CREATE INDEX IF NOT EXISTS idx_comments_post_thread ON public.comments(post_id, thread_path);

-- Step 4: Create thread path generation function
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create thread level calculation function
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create automatic thread info trigger
CREATE OR REPLACE FUNCTION set_comment_thread_info()
RETURNS trigger AS $$
BEGIN
  -- Set thread_level
  NEW.thread_level := get_thread_level(NEW.parent_id);
  
  -- Set thread_path
  NEW.thread_path := get_next_thread_path(NEW.parent_id, NEW.post_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger to ensure it's updated
DROP TRIGGER IF EXISTS trigger_set_comment_thread_info ON public.comments;
CREATE TRIGGER trigger_set_comment_thread_info
  BEFORE INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION set_comment_thread_info();

-- Step 7: Create optimized comment tree query function
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Update existing comments to have proper threading info
DO $$
DECLARE
  comment_record RECORD;
  counter INTEGER := 1;
BEGIN
  -- Update existing top-level comments that don't have thread_path
  FOR comment_record IN 
    SELECT id FROM public.comments 
    WHERE parent_id IS NULL AND thread_path IS NULL
    ORDER BY created_at
  LOOP
    UPDATE public.comments 
    SET thread_level = 0, thread_path = counter::text
    WHERE id = comment_record.id;
    counter := counter + 1;
  END LOOP;
  
  RAISE NOTICE 'Updated % existing top-level comments', counter - 1;
END $$;

-- Step 9: Create utility function for reply count
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