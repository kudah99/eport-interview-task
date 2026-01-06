-- Migration: Add image_urls field to assets table to store up to 4 image URLs
-- Run this SQL if you already have the assets table created

ALTER TABLE assets
ADD COLUMN IF NOT EXISTS image_urls JSONB;

COMMENT ON COLUMN assets.image_urls IS 'Array of image URLs (up to 4) associated with the asset';


