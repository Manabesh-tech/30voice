-- Migration: add_threaded_replies_support
-- Created at: 1754212554

-- Add parent_id column to support threaded conversations (replies to replies)
ALTER TABLE voice_note_replies ADD COLUMN parent_id UUID DEFAULT NULL;

-- Add comment to explain the schema
COMMENT ON COLUMN voice_note_replies.parent_id IS 'References voice_note_replies.id for nested replies. NULL means reply to original voice note.';

-- Create index for better performance when fetching thread hierarchies
CREATE INDEX idx_voice_note_replies_parent_id ON voice_note_replies(parent_id);
CREATE INDEX idx_voice_note_replies_voice_note_parent ON voice_note_replies(voice_note_id, parent_id);;