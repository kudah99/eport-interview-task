-- Profile Update Requests Table
-- Run this SQL in your Supabase SQL Editor to create the profile_update_requests table

CREATE TABLE IF NOT EXISTS profile_update_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_name TEXT,
  requested_name TEXT,
  current_email TEXT NOT NULL,
  requested_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profile_update_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_update_requests
-- Allow users to read their own requests
CREATE POLICY "Users can read their own requests"
  ON profile_update_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own requests
CREATE POLICY "Users can create their own requests"
  ON profile_update_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow admins to read all requests
CREATE POLICY "Admins can read all requests"
  ON profile_update_requests
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- Allow admins to update all requests
CREATE POLICY "Admins can update all requests"
  ON profile_update_requests
  FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profile_update_requests_user_id ON profile_update_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_update_requests_status ON profile_update_requests(status);
CREATE INDEX IF NOT EXISTS idx_profile_update_requests_created_at ON profile_update_requests(created_at);

