-- Create the tutor-proofs storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('tutor-proofs', 'tutor-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: authenticated students can upload their own proof files
CREATE POLICY "students_can_upload_own_proofs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tutor-proofs'
  AND name LIKE (auth.uid()::text || '%')
);

-- Policy: authenticated students can read their own proof files
CREATE POLICY "students_can_read_own_proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'tutor-proofs'
  AND name LIKE (auth.uid()::text || '%')
);

-- Policy: admins can read all proof files
CREATE POLICY "admins_can_read_all_proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'tutor-proofs'
  AND (
    SELECT is_admin FROM public.profiles
    WHERE id = auth.uid()
  )
);