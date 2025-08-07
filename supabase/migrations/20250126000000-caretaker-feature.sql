-- ==========================================
-- PAWPAL CARETAKER FEATURE
-- Complete setup for pet care requests and applications
-- ==========================================

-- Step 1: Create care_requests table
CREATE TABLE IF NOT EXISTS public.care_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    owner_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title varchar(255) NOT NULL,
    description text,
    location varchar(255) NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    compensation decimal(10,2),
    compensation_type varchar(50) DEFAULT 'total', -- 'total', 'daily', 'hourly'
    instructions text,
    status varchar(50) DEFAULT 'open' NOT NULL, -- 'open', 'assigned', 'completed', 'cancelled'
    assigned_caretaker_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 2: Create care_applications table
CREATE TABLE IF NOT EXISTS public.care_applications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id uuid NOT NULL REFERENCES public.care_requests(id) ON DELETE CASCADE,
    applicant_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message text NOT NULL,
    proposed_rate decimal(10,2),
    status varchar(50) DEFAULT 'pending' NOT NULL, -- 'pending', 'approved', 'rejected'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure one application per user per request
    UNIQUE(request_id, applicant_id)
);

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_care_requests_owner_id ON public.care_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_care_requests_status ON public.care_requests(status);
CREATE INDEX IF NOT EXISTS idx_care_requests_start_date ON public.care_requests(start_date);
CREATE INDEX IF NOT EXISTS idx_care_requests_location ON public.care_requests(location);
CREATE INDEX IF NOT EXISTS idx_care_applications_request_id ON public.care_applications(request_id);
CREATE INDEX IF NOT EXISTS idx_care_applications_applicant_id ON public.care_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_care_applications_status ON public.care_applications(status);

-- Step 4: Create RLS policies for care_requests
ALTER TABLE public.care_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all open care requests
CREATE POLICY "Anyone can view open care requests" ON public.care_requests
    FOR SELECT USING (status = 'open' OR auth.uid() = owner_id OR auth.uid() = assigned_caretaker_id);

-- Policy: Only pet owners can create care requests for their pets
CREATE POLICY "Users can create care requests for their pets" ON public.care_requests
    FOR INSERT WITH CHECK (
        auth.uid() = owner_id AND 
        EXISTS (SELECT 1 FROM public.pets WHERE id = pet_id AND owner_id = auth.uid())
    );

-- Policy: Only owners can update their care requests
CREATE POLICY "Users can update their own care requests" ON public.care_requests
    FOR UPDATE USING (auth.uid() = owner_id);

-- Policy: Only owners can delete their care requests
CREATE POLICY "Users can delete their own care requests" ON public.care_requests
    FOR DELETE USING (auth.uid() = owner_id);

-- Step 5: Create RLS policies for care_applications
ALTER TABLE public.care_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Applicants and request owners can view applications
CREATE POLICY "Users can view relevant applications" ON public.care_applications
    FOR SELECT USING (
        auth.uid() = applicant_id OR 
        auth.uid() IN (SELECT owner_id FROM public.care_requests WHERE id = request_id)
    );

-- Policy: Authenticated users can apply to care requests
CREATE POLICY "Users can create applications" ON public.care_applications
    FOR INSERT WITH CHECK (
        auth.uid() = applicant_id AND
        EXISTS (SELECT 1 FROM public.care_requests WHERE id = request_id AND status = 'open')
    );

-- Policy: Applicants can update their applications (before approval)
CREATE POLICY "Users can update their pending applications" ON public.care_applications
    FOR UPDATE USING (auth.uid() = applicant_id AND status = 'pending');

-- Policy: Request owners can update application status
CREATE POLICY "Request owners can update application status" ON public.care_applications
    FOR UPDATE USING (
        auth.uid() IN (SELECT owner_id FROM public.care_requests WHERE id = request_id)
    );

-- Policy: Applicants can delete their pending applications
CREATE POLICY "Users can delete their pending applications" ON public.care_applications
    FOR DELETE USING (auth.uid() = applicant_id AND status = 'pending');

-- Step 6: Create functions for business logic

-- Function to get care request with pet and owner details
CREATE OR REPLACE FUNCTION get_care_requests_with_details()
RETURNS TABLE (
    id uuid,
    pet_id uuid,
    owner_id uuid,
    title varchar(255),
    description text,
    location varchar(255),
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    compensation decimal(10,2),
    compensation_type varchar(50),
    instructions text,
    status varchar(50),
    assigned_caretaker_id uuid,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    pet_name varchar(255),
    pet_type varchar(100),
    pet_image_url text,
    owner_name varchar(255),
    owner_avatar_url text,
    applications_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
        p.name as pet_name,
        p.type as pet_type,
        CASE 
            WHEN array_length(p.image_urls, 1) > 0 THEN p.image_urls[1]
            ELSE NULL 
        END as pet_image_url,
        u.name as owner_name,
        u.avatar_url as owner_avatar_url,
        COALESCE(app_count.count, 0) as applications_count
    FROM public.care_requests cr
    JOIN public.pets p ON cr.pet_id = p.id
    JOIN public.users u ON cr.owner_id = u.id
    LEFT JOIN (
        SELECT request_id, COUNT(*) as count 
        FROM public.care_applications 
        WHERE status = 'pending'
        GROUP BY request_id
    ) app_count ON cr.id = app_count.request_id
    ORDER BY cr.created_at DESC;
END;
$$;

-- Function to approve care application and update request
CREATE OR REPLACE FUNCTION approve_care_application(application_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    request_id_var uuid;
    applicant_id_var uuid;
BEGIN
    -- Get request and applicant info
    SELECT request_id, applicant_id INTO request_id_var, applicant_id_var
    FROM public.care_applications 
    WHERE id = application_id;
    
    IF request_id_var IS NULL THEN
        RETURN false;
    END IF;
    
    -- Approve the application
    UPDATE public.care_applications 
    SET status = 'approved', updated_at = NOW()
    WHERE id = application_id;
    
    -- Reject all other applications for this request
    UPDATE public.care_applications 
    SET status = 'rejected', updated_at = NOW()
    WHERE request_id = request_id_var AND id != application_id;
    
    -- Update the care request status and assign caretaker
    UPDATE public.care_requests 
    SET status = 'assigned', 
        assigned_caretaker_id = applicant_id_var,
        updated_at = NOW()
    WHERE id = request_id_var;
    
    RETURN true;
END;
$$;

-- Step 7: Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 8: Create triggers for updated_at
CREATE TRIGGER update_care_requests_updated_at 
    BEFORE UPDATE ON public.care_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_care_applications_updated_at 
    BEFORE UPDATE ON public.care_applications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Grant necessary permissions
GRANT ALL ON public.care_requests TO authenticated;
GRANT ALL ON public.care_applications TO authenticated;
GRANT EXECUTE ON FUNCTION get_care_requests_with_details() TO authenticated;
GRANT EXECUTE ON FUNCTION approve_care_application(uuid) TO authenticated;