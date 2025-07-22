-- Sample pets for testing the messaging and adoption flow
-- Run this in your Supabase SQL editor

-- First, let's create a sample pet owner user (replace with actual user ID from your auth.users table)
-- You'll need to update the owner_id values below with actual user IDs

INSERT INTO public.pets (
  name, 
  type, 
  breed, 
  gender, 
  age, 
  description, 
  location, 
  image_urls, 
  is_adopted,
  owner_id
) VALUES 
-- Sample Pet 1: Buddy the Golden Retriever
(
  'Buddy',
  'Dog',
  'Golden Retriever',
  'male',
  36, -- 3 years old (36 months)
  'Buddy is a friendly and energetic Golden Retriever who loves playing fetch and swimming. He''s great with kids and other dogs. Looking for a new home due to family relocation.',
  'San Francisco, CA',
  ARRAY['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'],
  false,
  '00000000-0000-0000-0000-000000000000' -- Replace with actual user ID
),

-- Sample Pet 2: Luna the Persian Cat
(
  'Luna',
  'Cat',
  'Persian',
  'female',
  24, -- 2 years old
  'Luna is a beautiful Persian cat who loves to cuddle and watch birds from the window. She''s very calm and would be perfect for a quiet home. Rehoming due to allergies.',
  'Los Angeles, CA',
  ARRAY['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400', 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=400'],
  false,
  '00000000-0000-0000-0000-000000000000' -- Replace with actual user ID
),

-- Sample Pet 3: Max the German Shepherd
(
  'Max',
  'Dog',
  'German Shepherd',
  'male',
  60, -- 5 years old
  'Max is a loyal and intelligent German Shepherd. He''s well-trained and great for protection. Looking for an experienced dog owner who can give him the exercise he needs.',
  'New York, NY',
  ARRAY['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400'],
  false,
  '00000000-0000-0000-0000-000000000000' -- Replace with actual user ID
),

-- Sample Pet 4: Whiskers the Tabby Cat
(
  'Whiskers',
  'Cat',
  'Tabby',
  'male',
  18, -- 1.5 years old
  'Whiskers is a playful young tabby who loves toys and treats. He''s very social and would love a home with other cats or as an only pet with lots of attention.',
  'Austin, TX',
  ARRAY['https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400'],
  false,
  '00000000-0000-0000-0000-000000000000' -- Replace with actual user ID
),

-- Sample Pet 5: Bella the Labrador Mix
(
  'Bella',
  'Dog',
  'Labrador Mix',
  'female',
  42, -- 3.5 years old
  'Bella is a sweet Labrador mix who loves everyone she meets. She''s house-trained and knows basic commands. Perfect family dog looking for her forever home.',
  'Seattle, WA',
  ARRAY['https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400', 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=400'],
  false,
  '00000000-0000-0000-0000-000000000000' -- Replace with actual user ID
);

-- Note: To use this data:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Replace the '00000000-0000-0000-0000-000000000000' values with actual user IDs from your auth.users table
-- 4. Run this script
-- 
-- To get actual user IDs, first run:
-- SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5; 