-- ShilpSaathi Database Schema for Supabase / PostgreSQL
-- Run this in the Supabase SQL Editor to create the required tables

-- Enable UUID extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Artisans / Users table
CREATE TABLE IF NOT EXISTS artisans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    preferred_language VARCHAR(50) DEFAULT 'hi',
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products / Catalog Items table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID REFERENCES artisans(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    material VARCHAR(100),
    colour VARCHAR(100),
    craft_type VARCHAR(100),
    description_hi TEXT,
    description_en TEXT,
    keywords TEXT[],
    original_image_url TEXT,
    image_url TEXT NOT NULL,
    price_min NUMERIC(10, 2),
    price_max NUMERIC(10, 2),
    final_price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processing Pipeline Logs table
CREATE TABLE IF NOT EXISTS processing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    operation VARCHAR(50) NOT NULL, -- 'image_enhance', 'voice_transcription', 'pricing'
    status VARCHAR(50) NOT NULL,    -- 'pending', 'completed', 'failed'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_artisan_id ON products(artisan_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_processing_logs_product_id ON processing_logs(product_id);

-- Enable Row Level Security (optional - uncomment if needed)
-- ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE processing_logs ENABLE ROW LEVEL SECURITY;

-- Insert a demo artisan for development
INSERT INTO artisans (name, phone, preferred_language, location)
VALUES ('Demo Artisan', '0000000000', 'hi', 'India')
ON CONFLICT (phone) DO NOTHING;
