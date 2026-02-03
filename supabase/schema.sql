-- Contacts Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Basic info
  full_name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  job_title TEXT,
  linkedin_url TEXT,
  phone TEXT,
  photo_url TEXT,

  -- Source
  source TEXT DEFAULT 'manual', -- 'manual', 'gmail', 'linkedin_csv'

  -- Tags (simple array for MVP)
  tags TEXT[] DEFAULT '{}',

  -- Enrichment data (stored as JSON for flexibility)
  enrichment JSONB,
  enriched_at TIMESTAMPTZ,

  -- User
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Google tokens table
CREATE TABLE IF NOT EXISTS google_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  access_token TEXT,
  refresh_token TEXT,
  expiry_date BIGINT,
  email TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_source ON contacts(source);

-- Full text search index (optional, for better search performance)
CREATE INDEX IF NOT EXISTS idx_contacts_search ON contacts
  USING gin(to_tsvector('english', full_name || ' ' || COALESCE(email, '') || ' ' || COALESCE(company, '')));

-- Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_tokens ENABLE ROW LEVEL SECURITY;

-- Contacts policies - users can only access their own contacts
CREATE POLICY "Users can view their own contacts"
  ON contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
  ON contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON contacts FOR DELETE
  USING (auth.uid() = user_id);

-- Google tokens policies
CREATE POLICY "Users can view their own google tokens"
  ON google_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own google tokens"
  ON google_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own google tokens"
  ON google_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own google tokens"
  ON google_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- User preferences table (for table settings like sort, pagination)
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  sort_column TEXT DEFAULT 'tags',
  sort_direction TEXT DEFAULT 'desc',
  rows_per_page INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for contacts updated_at
DROP TRIGGER IF EXISTS contacts_updated_at ON contacts;
CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger for user_preferences updated_at
DROP TRIGGER IF EXISTS user_preferences_updated_at ON user_preferences;
CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
