-- Drop the old function first (return type changed from VOID to BOOLEAN)
DROP FUNCTION IF EXISTS public.approve_care_application(UUID);

-- Recreate with security fix and correct return type
CREATE FUNCTION public.approve_care_application(application_id UUID)
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