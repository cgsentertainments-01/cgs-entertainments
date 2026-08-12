-- Migration to add video_path and video_url columns to participants table and set up dance-videos storage bucket policies

-- 1. Add video_path and video_url columns to participants table if they do not exist
ALTER TABLE IF EXISTS public.participants 
ADD COLUMN IF NOT EXISTS video_path TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 2. Ensure dance-videos storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('dance-videos', 'dance-videos', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS Policies for dance-videos bucket
DO $$ 
BEGIN
    -- Public upload access for dance-videos storage bucket during registration
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public Upload Access for Dance Videos Bucket'
    ) THEN
        CREATE POLICY "Public Upload Access for Dance Videos Bucket" ON storage.objects
            FOR INSERT TO public
            WITH CHECK (bucket_id = 'dance-videos');
    END IF;

    -- Admin full access for dance-videos storage bucket
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Admin Full Access for Dance Videos Bucket'
    ) THEN
        CREATE POLICY "Admin Full Access for Dance Videos Bucket" ON storage.objects
            FOR ALL TO authenticated
            USING (bucket_id = 'dance-videos')
            WITH CHECK (bucket_id = 'dance-videos');
    END IF;
END $$;
