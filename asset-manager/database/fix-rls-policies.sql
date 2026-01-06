-- Fix RLS Policies to use auth.jwt() instead of auth.users table
-- This fixes the "permission denied for table users" error
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage categories" ON asset_categories;
DROP POLICY IF EXISTS "Admins can manage departments" ON departments;
DROP POLICY IF EXISTS "Admins can manage assets" ON assets;

-- Recreate policies using auth.jwt() instead of auth.users
-- This is the correct way to check user metadata in RLS policies

-- RLS Policies for asset_categories
CREATE POLICY "Admins can manage categories"
  ON asset_categories
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- RLS Policies for departments
CREATE POLICY "Admins can manage departments"
  ON departments
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- RLS Policies for assets
CREATE POLICY "Admins can manage assets"
  ON assets
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

