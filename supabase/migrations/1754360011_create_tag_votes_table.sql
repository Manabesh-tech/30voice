-- Migration: create_tag_votes_table
-- Created at: 1754360011

-- Create tag_votes table for tracking votes on individual tags
CREATE TABLE IF NOT EXISTS tag_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES voice_note_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one vote per user per tag
  UNIQUE(user_id, tag_id)
);

-- Add RLS policies
ALTER TABLE tag_votes ENABLE ROW LEVEL SECURITY;

-- Allow users to read all tag votes
CREATE POLICY "Allow read access to tag votes" ON tag_votes
  FOR SELECT USING (true);

-- Allow authenticated users to insert their own votes
CREATE POLICY "Allow users to vote on tags" ON tag_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own votes
CREATE POLICY "Allow users to remove their votes" ON tag_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_tag_votes_tag_id ON tag_votes(tag_id);
CREATE INDEX IF NOT EXISTS idx_tag_votes_user_id ON tag_votes(user_id);;