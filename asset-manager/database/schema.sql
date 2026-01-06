-- Asset Manager Database Schema
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Asset Categories Table
CREATE TABLE IF NOT EXISTS asset_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets Table
CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  date_purchased DATE,
  cost NUMERIC(12, 2),
  department TEXT,
  status TEXT DEFAULT 'active',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for asset_categories
-- Allow admins to do everything
CREATE POLICY "Admins can manage categories"
  ON asset_categories
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- Allow all authenticated users to read categories
CREATE POLICY "Users can read categories"
  ON asset_categories
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- RLS Policies for departments
-- Allow admins to do everything
CREATE POLICY "Admins can manage departments"
  ON departments
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- Allow all authenticated users to read departments
CREATE POLICY "Users can read departments"
  ON departments
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- RLS Policies for assets
-- Allow admins to do everything
CREATE POLICY "Admins can manage assets"
  ON assets
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- Allow all authenticated users to read assets
CREATE POLICY "Users can read assets"
  ON assets
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow all authenticated users to insert assets
CREATE POLICY "Users can insert assets"
  ON assets
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own assets (if needed in future)
-- For now, only admins can update/delete

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_department ON assets(department);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at);

