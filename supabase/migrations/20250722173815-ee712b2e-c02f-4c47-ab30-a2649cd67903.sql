-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.saved_items CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.adoption_requests CASCADE;
DROP TABLE IF EXISTS public.pets CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- USERS (extended profile for Supabase Auth)
CREATE TABLE public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  bio text,
  avatar_url text,
  location text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile"
ON public.users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

-- PETS (Adoption Listings)
CREATE TABLE public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.users(id) on delete cascade,
  name text,
  type text, -- e.g., Dog, Cat, Rabbit, Bird
  breed text,
  gender text, -- Male / Female / Unknown
  age int, -- in months or years
  description text,
  image_urls text[],
  location text,
  is_adopted boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pets
CREATE POLICY "Anyone can view pets"
ON public.pets FOR SELECT
USING (true);

CREATE POLICY "Users can create their own pet listings"
ON public.pets FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own pet listings"
ON public.pets FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own pet listings"
ON public.pets FOR DELETE
USING (auth.uid() = owner_id);

-- ADOPTION REQUESTS
CREATE TABLE public.adoption_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  pet_id uuid references public.pets(id) on delete cascade,
  message text,
  status text default 'pending', -- pending / approved / rejected
  created_at timestamp with time zone default now()
);

-- Enable RLS
ALTER TABLE public.adoption_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for adoption_requests
CREATE POLICY "Users can view adoption requests they made"
ON public.adoption_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Pet owners can view adoption requests for their pets"
ON public.adoption_requests FOR SELECT
USING (auth.uid() IN (SELECT owner_id FROM public.pets WHERE id = pet_id));

CREATE POLICY "Users can create adoption requests"
ON public.adoption_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pet owners can update adoption requests for their pets"
ON public.adoption_requests FOR UPDATE
USING (auth.uid() IN (SELECT owner_id FROM public.pets WHERE id = pet_id));

-- COMMUNITY POSTS ("PAWS")
CREATE TABLE public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  content text,
  image_urls text[],
  pet_id uuid references public.pets(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts
CREATE POLICY "Anyone can view posts"
ON public.posts FOR SELECT
USING (true);

CREATE POLICY "Users can create their own posts"
ON public.posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON public.posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.posts FOR DELETE
USING (auth.uid() = user_id);

-- LIKES on POSTS
CREATE TABLE public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique (user_id, post_id)
);

-- Enable RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for likes
CREATE POLICY "Anyone can view likes"
ON public.likes FOR SELECT
USING (true);

CREATE POLICY "Users can create their own likes"
ON public.likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
ON public.likes FOR DELETE
USING (auth.uid() = user_id);

-- COMMENTS on POSTS
CREATE TABLE public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  content text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments
CREATE POLICY "Anyone can view comments"
ON public.comments FOR SELECT
USING (true);

CREATE POLICY "Users can create their own comments"
ON public.comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.comments FOR DELETE
USING (auth.uid() = user_id);

-- SAVED PETS or POSTS (BOOKMARKS)
CREATE TABLE public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  item_type text, -- 'pet' or 'post'
  item_id uuid, -- reference to pet_id or post_id
  created_at timestamp with time zone default now()
);

-- Enable RLS
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_items
CREATE POLICY "Users can view their own saved items"
ON public.saved_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved items"
ON public.saved_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved items"
ON public.saved_items FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger function for automatic user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name)
  VALUES (new.id, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();