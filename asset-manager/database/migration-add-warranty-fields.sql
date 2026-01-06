-- Migration: Add warranty fields to assets table
-- Run this SQL in your Supabase SQL Editor to add warranty information columns

-- Add warranty period in months
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS warranty_period_months INTEGER;

-- Add warranty expiry date
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS warranty_expiry_date DATE;

-- Add warranty notes
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS warranty_notes TEXT;

-- Add warranty registered timestamp
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS warranty_registered_at TIMESTAMP WITH TIME ZONE;

-- Add warranty registered by user ID
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS warranty_registered_by UUID;

-- Add comments for documentation
COMMENT ON COLUMN assets.warranty_period_months IS 'Warranty period in months';
COMMENT ON COLUMN assets.warranty_expiry_date IS 'Date when the warranty expires';
COMMENT ON COLUMN assets.warranty_notes IS 'Additional notes about the warranty';
COMMENT ON COLUMN assets.warranty_registered_at IS 'Timestamp when warranty was registered';
COMMENT ON COLUMN assets.warranty_registered_by IS 'User ID who registered the warranty';

-- Create index for warranty expiry date for better query performance
CREATE INDEX IF NOT EXISTS idx_assets_warranty_expiry_date ON assets(warranty_expiry_date);

-- Add RLS policy to allow authenticated users to update assets for warranty registration
-- This allows users to register warranty without being admin
-- Note: The API route will enforce business logic (checking if warranty is already registered)
CREATE POLICY IF NOT EXISTS "Users can register warranty"
  ON assets
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

