-- Fix the approve_care_application function to include proper authentication and authorization
-- This function was SECURITY DEFINER but had no auth checks, allowing anyone to approve applications

-- Drop and recreate the function with proper security checks
CREATE OR REPLACE FUNCTION public.approve_care_application(application_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request_id UUID;
  v_applicant_id UUID;
  v_owner_id UUID;
BEGIN
  -- Get application and request info, including owner
  SELECT ca.request_id, ca.applicant_id, cr.owner_id
  INTO v_request_id, v_applicant_id, v_owner_id
  FROM public.care_applications ca
  JOIN public.care_requests cr ON ca.request_id = cr.id
  WHERE ca.id = application_id;
  
  -- Check if application exists
  IF v_request_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- CRITICAL: Verify caller is the request owner
  IF auth.uid() != v_owner_id THEN
    RAISE EXCEPTION 'Only the request owner can approve applications';
  END IF;
  
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
  
  RETURN true;
END;
$$;

-- Create storage bucket for pet images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-images', 'pet-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for post images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for pet-images bucket
CREATE POLICY "Users can upload their own pet images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pet-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own pet images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'pet-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own pet images"
ON storage.objects FOR DELETE
USING (bucket_id = 'pet-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Pet images are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'pet-images');

-- RLS policies for avatars bucket
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatars are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- RLS policies for post-images bucket
CREATE POLICY "Users can upload their own post images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own post images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own post images"
ON storage.objects FOR DELETE
USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Post images are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');