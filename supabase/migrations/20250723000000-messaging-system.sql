-- CONVERSATIONS TABLE
CREATE TABLE public.conversations (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references public.pets(id) on delete cascade,
  adopter_id uuid references public.users(id) on delete cascade,
  owner_id uuid references public.users(id) on delete cascade,
  status text default 'active', -- active, closed, completed
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  UNIQUE(pet_id, adopter_id) -- One conversation per pet per adopter
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they're part of"
ON public.conversations FOR SELECT
USING (auth.uid() = adopter_id OR auth.uid() = owner_id);

CREATE POLICY "Adopters can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() = adopter_id);

CREATE POLICY "Participants can update conversation status"
ON public.conversations FOR UPDATE
USING (auth.uid() = adopter_id OR auth.uid() = owner_id);

-- MESSAGES TABLE
CREATE TABLE public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid references public.users(id) on delete cascade,
  content text not null,
  message_type text default 'text', -- text, template, system
  template_id text, -- for pre-written templates
  created_at timestamp with time zone default now(),
  read_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE auth.uid() = adopter_id OR auth.uid() = owner_id
  )
);

CREATE POLICY "Users can send messages in their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE auth.uid() = adopter_id OR auth.uid() = owner_id
  )
  AND auth.uid() = sender_id
);

CREATE POLICY "Users can update read status of messages"
ON public.messages FOR UPDATE
USING (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE auth.uid() = adopter_id OR auth.uid() = owner_id
  )
);

-- NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  type text not null, -- message, adoption_request, adoption_status
  title text not null,
  content text not null,
  reference_id uuid, -- conversation_id, pet_id, etc.
  read boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp when new message is added
CREATE TRIGGER update_conversation_timestamp_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Function to create notification for new message
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id uuid;
  sender_name text;
  pet_name text;
BEGIN
  -- Get recipient (the other person in conversation)
  SELECT CASE 
    WHEN adopter_id = NEW.sender_id THEN owner_id 
    ELSE adopter_id 
  END INTO recipient_id
  FROM public.conversations 
  WHERE id = NEW.conversation_id;

  -- Get sender name
  SELECT name INTO sender_name 
  FROM public.users 
  WHERE id = NEW.sender_id;

  -- Get pet name
  SELECT p.name INTO pet_name
  FROM public.pets p
  JOIN public.conversations c ON c.pet_id = p.id
  WHERE c.id = NEW.conversation_id;

  -- Create notification
  INSERT INTO public.notifications (
    user_id, 
    type, 
    title, 
    content, 
    reference_id
  ) VALUES (
    recipient_id,
    'message',
    'New message about ' || pet_name,
    sender_name || ' sent you a message',
    NEW.conversation_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notification for new messages
CREATE TRIGGER create_message_notification_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification(); 