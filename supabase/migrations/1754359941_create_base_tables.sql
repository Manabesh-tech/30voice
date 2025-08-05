-- Migration: create_base_tables
-- Created at: 1754359941

-- Create base voice_notes table
CREATE TABLE voice_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0,
  transcript TEXT,
  tldr_text TEXT,
  action_text TEXT,
  listen_count INTEGER DEFAULT 0,
  humourous_count INTEGER DEFAULT 0,
  informative_count INTEGER DEFAULT 0,
  game_changer_count INTEGER DEFAULT 0,
  useful_count INTEGER DEFAULT 0,
  thought_provoking_count INTEGER DEFAULT 0,
  debatable_count INTEGER DEFAULT 0,
  low_quality_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT,
  company TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for voice_notes
CREATE POLICY "Voice notes are viewable by everyone" ON voice_notes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own voice notes" ON voice_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice notes" ON voice_notes
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for user_profiles
CREATE POLICY "Profiles are viewable by everyone" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);;