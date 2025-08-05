-- Migration: fix_voice_note_tags_permissions
-- Created at: 1754194211

-- Enable RLS and create proper policies for voice_note_tags table
ALTER TABLE voice_note_tags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow read access to voice note tags" ON voice_note_tags;
DROP POLICY IF EXISTS "Allow users to create tags" ON voice_note_tags;
DROP POLICY IF EXISTS "Allow authenticated access to voice note tags" ON voice_note_tags;

-- Allow public read access to voice note tags
CREATE POLICY "Allow read access to voice note tags" ON voice_note_tags
  FOR SELECT USING (true);

-- Allow authenticated users to insert tags
CREATE POLICY "Allow users to create tags" ON voice_note_tags
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update tags  
CREATE POLICY "Allow users to update tags" ON voice_note_tags
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_voice_note_tags_voice_note_id ON voice_note_tags(voice_note_id);
CREATE INDEX IF NOT EXISTS idx_voice_note_tags_tag_name ON voice_note_tags(tag_name);;