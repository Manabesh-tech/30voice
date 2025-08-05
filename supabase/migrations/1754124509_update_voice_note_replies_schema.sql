-- Migration: update_voice_note_replies_schema
-- Created at: 1754124509

-- Update voice_note_replies table to support both text and voice replies
ALTER TABLE voice_note_replies 
ADD COLUMN IF NOT EXISTS content_type text CHECK (content_type IN ('text', 'voice')) DEFAULT 'text',
ADD COLUMN IF NOT EXISTS text_content text,
ADD COLUMN IF NOT EXISTS audio_url text,
ADD COLUMN IF NOT EXISTS audio_url_mp3 text,
ADD COLUMN IF NOT EXISTS duration integer;

-- Update existing records to use the new schema
UPDATE voice_note_replies 
SET 
  content_type = 'text',
  text_content = reply_text
WHERE content_type IS NULL;

-- Make reply_text nullable since we now have text_content
ALTER TABLE voice_note_replies ALTER COLUMN reply_text DROP NOT NULL;;