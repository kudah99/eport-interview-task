-- Migration: Add date_purchased and cost fields to assets table
-- Run this SQL if you already have the assets table created

-- Add date_purchased column
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS date_purchased DATE;

-- Add cost column
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS cost NUMERIC(12, 2);

-- Update the hint in error messages
COMMENT ON COLUMN assets.date_purchased IS 'Date when the asset was purchased';
COMMENT ON COLUMN assets.cost IS 'Purchase cost of the asset';

