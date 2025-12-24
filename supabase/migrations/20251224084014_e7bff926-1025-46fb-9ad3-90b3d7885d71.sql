-- Create users table (profiles)
CREATE TABLE public.users (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Create pets table
CREATE TABLE public.pets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  breed TEXT NOT NULL,
  gender TEXT NOT NULL,
  age INTEGER NOT NULL,
  description TEXT,
  image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  location TEXT,
  is_adopted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Pets policies
CREATE POLICY "Anyone can view pets" ON public.pets FOR SELECT USING (true);
CREATE POLICY "Users can create their own pets" ON public.pets FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own pets" ON public.pets FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own pets" ON public.pets FOR DELETE USING (auth.uid() = owner_id);

-- Create posts table
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_repost BOOLEAN DEFAULT false,
  original_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  repost_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Anyone can view posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Create likes table
CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Likes policies
CREATE POLICY "Anyone can view likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can create their own likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Create reposts table
CREATE TABLE public.reposts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  original_post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  repost_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, original_post_id)
);

-- Enable RLS
ALTER TABLE public.reposts ENABLE ROW LEVEL SECURITY;

-- Reposts policies
CREATE POLICY "Anyone can view reposts" ON public.reposts FOR SELECT USING (true);
CREATE POLICY "Users can create their own reposts" ON public.reposts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reposts" ON public.reposts FOR DELETE USING (auth.uid() = user_id);

-- Create comments table with threading support
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  reply_to_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  thread_level INTEGER NOT NULL DEFAULT 0,
  thread_path TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Create index for efficient comment threading
CREATE INDEX idx_comments_thread_path ON public.comments(post_id, thread_path);
CREATE INDEX idx_comments_parent ON public.comments(parent_id);

-- Create follows table
CREATE TABLE public.follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Follows policies
CREATE POLICY "Anyone can view follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can create their own follows" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete their own follows" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  reference_id UUID,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create saved_items table
CREATE TABLE public.saved_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id, item_type)
);

-- Enable RLS
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

-- Saved items policies
CREATE POLICY "Users can view their own saved items" ON public.saved_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own saved items" ON public.saved_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own saved items" ON public.saved_items FOR DELETE USING (auth.uid() = user_id);

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  adopter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pet_id, adopter_id)
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view their own conversations" ON public.conversations FOR SELECT USING (auth.uid() = adopter_id OR auth.uid() = owner_id);
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = adopter_id);
CREATE POLICY "Participants can update conversations" ON public.conversations FOR UPDATE USING (auth.uid() = adopter_id OR auth.uid() = owner_id);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  template_id TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages policies (participants can view and create messages in their conversations)
CREATE POLICY "Conversation participants can view messages" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id 
    AND (c.adopter_id = auth.uid() OR c.owner_id = auth.uid())
  )
);
CREATE POLICY "Conversation participants can create messages" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id 
    AND (c.adopter_id = auth.uid() OR c.owner_id = auth.uid())
  )
);
CREATE POLICY "Conversation participants can update messages" ON public.messages FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id 
    AND (c.adopter_id = auth.uid() OR c.owner_id = auth.uid())
  )
);

-- Create care_requests table
CREATE TABLE public.care_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  compensation DECIMAL(10,2),
  compensation_type TEXT,
  instructions TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  assigned_caretaker_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.care_requests ENABLE ROW LEVEL SECURITY;

-- Care requests policies
CREATE POLICY "Anyone can view open care requests" ON public.care_requests FOR SELECT USING (true);
CREATE POLICY "Users can create their own care requests" ON public.care_requests FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own care requests" ON public.care_requests FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own care requests" ON public.care_requests FOR DELETE USING (auth.uid() = owner_id);

-- Create care_applications table
CREATE TABLE public.care_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.care_requests(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  proposed_rate DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(request_id, applicant_id)
);

-- Enable RLS
ALTER TABLE public.care_applications ENABLE ROW LEVEL SECURITY;

-- Care applications policies
CREATE POLICY "Request owners can view applications" ON public.care_applications FOR SELECT USING (
  auth.uid() = applicant_id OR
  EXISTS (
    SELECT 1 FROM public.care_requests cr 
    WHERE cr.id = request_id AND cr.owner_id = auth.uid()
  )
);
CREATE POLICY "Users can create applications" ON public.care_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Application owners can update" ON public.care_applications FOR UPDATE USING (
  auth.uid() = applicant_id OR
  EXISTS (
    SELECT 1 FROM public.care_requests cr 
    WHERE cr.id = request_id AND cr.owner_id = auth.uid()
  )
);
CREATE POLICY "Application owners can delete" ON public.care_applications FOR DELETE USING (auth.uid() = applicant_id);

-- Function to get care requests with details
CREATE OR REPLACE FUNCTION public.get_care_requests_with_details()
RETURNS TABLE (
  id UUID,
  pet_id UUID,
  owner_id UUID,
  title TEXT,
  description TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  compensation DECIMAL,
  compensation_type TEXT,
  instructions TEXT,
  status TEXT,
  assigned_caretaker_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  pet_name TEXT,
  pet_type TEXT,
  pet_image_url TEXT,
  owner_name TEXT,
  owner_avatar_url TEXT,
  applications_count BIGINT
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id,
    cr.pet_id,
    cr.owner_id,
    cr.title,
    cr.description,
    cr.location,
    cr.start_date,
    cr.end_date,
    cr.compensation,
    cr.compensation_type,
    cr.instructions,
    cr.status,
    cr.assigned_caretaker_id,
    cr.created_at,
    cr.updated_at,
    p.name AS pet_name,
    p.type AS pet_type,
    p.image_urls[1] AS pet_image_url,
    u.name AS owner_name,
    u.avatar_url AS owner_avatar_url,
    (SELECT COUNT(*) FROM public.care_applications ca WHERE ca.request_id = cr.id) AS applications_count
  FROM public.care_requests cr
  JOIN public.pets p ON cr.pet_id = p.id
  JOIN public.users u ON cr.owner_id = u.id
  WHERE cr.status = 'open'
  ORDER BY cr.created_at DESC;
END;
$$;

-- Function to approve care application
CREATE OR REPLACE FUNCTION public.approve_care_application(application_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_request_id UUID;
  v_applicant_id UUID;
BEGIN
  -- Get application details
  SELECT request_id, applicant_id INTO v_request_id, v_applicant_id
  FROM public.care_applications
  WHERE id = application_id;
  
  -- Update application status
  UPDATE public.care_applications
  SET status = 'approved', updated_at = now()
  WHERE id = application_id;
  
  -- Reject other applications
  UPDATE public.care_applications
  SET status = 'rejected', updated_at = now()
  WHERE request_id = v_request_id AND id != application_id;
  
  -- Update care request
  UPDATE public.care_requests
  SET status = 'assigned', assigned_caretaker_id = v_applicant_id, updated_at = now()
  WHERE id = v_request_id;
END;
$$;

-- Trigger function for thread path
CREATE OR REPLACE FUNCTION public.set_comment_thread_info()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  parent_path TEXT;
  parent_level INTEGER;
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.thread_level := 0;
    NEW.thread_path := NEW.id::TEXT;
  ELSE
    SELECT thread_path, thread_level INTO parent_path, parent_level
    FROM public.comments WHERE id = NEW.parent_id;
    
    NEW.thread_level := COALESCE(parent_level, 0) + 1;
    NEW.thread_path := COALESCE(parent_path, '') || '/' || NEW.id::TEXT;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for comments
CREATE TRIGGER set_comment_thread_info_trigger
BEFORE INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.set_comment_thread_info();

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON public.pets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_care_requests_updated_at BEFORE UPDATE ON public.care_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_care_applications_updated_at BEFORE UPDATE ON public.care_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();