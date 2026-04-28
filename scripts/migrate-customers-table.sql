-- Migration to add missing columns to customers table
-- Run this after setup-all-tables.sql to add the lifetime_value and other missing columns

-- Add missing columns to customers table
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS lifetime_value INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS preferred_brands TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update the tier check constraint to match the application values
ALTER TABLE public.customers
DROP CONSTRAINT IF EXISTS customers_tier_check,
ADD CONSTRAINT customers_tier_check
CHECK (tier IN ('standard', 'heritage', 'platinum', 'vip_ambassador', 'private_equity'));