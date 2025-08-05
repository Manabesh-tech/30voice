-- Migration: add_soft_delete_and_policies
-- Created at: 1754215520

-- Add soft delete column to voice_notes
ALTER TABLE voice_notes ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

-- Add soft delete column to voice_note_replies  
ALTER TABLE voice_note_replies ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

-- Create index for better performance on non-deleted records
CREATE INDEX idx_voice_notes_not_deleted ON voice_notes(is_deleted) WHERE is_deleted = FALSE;
CREATE INDEX idx_voice_note_replies_not_deleted ON voice_note_replies(is_deleted) WHERE is_deleted = FALSE;

-- Row Level Security policies for voice_notes deletion (soft delete via UPDATE)
DROP POLICY IF EXISTS "Users can delete their own voice notes" ON voice_notes;
CREATE POLICY "Users can delete their own voice notes"
ON voice_notes FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Row Level Security policies for voice_note_replies deletion (soft delete via UPDATE)  
DROP POLICY IF EXISTS "Users can delete their own replies" ON voice_note_replies;
CREATE POLICY "Users can delete their own replies"
ON voice_note_replies FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update existing SELECT policies to exclude deleted records
DROP POLICY IF EXISTS "Voice notes are viewable by everyone" ON voice_notes;
CREATE POLICY "Voice notes are viewable by everyone"
ON voice_notes FOR SELECT
USING (is_deleted = FALSE);

DROP POLICY IF EXISTS "Voice note replies are viewable by everyone" ON voice_note_replies;
CREATE POLICY "Voice note replies are viewable by everyone"
ON voice_note_replies FOR SELECT
USING (is_deleted = FALSE);;