-- Migration: add_deleted_at_timestamp
-- Created at: 1754360000

-- Add deleted_at timestamp column to voice_notes
ALTER TABLE voice_notes ADD COLUMN deleted_at TIMESTAMPTZ;

-- Add deleted_at timestamp column to voice_note_replies  
ALTER TABLE voice_note_replies ADD COLUMN deleted_at TIMESTAMPTZ;;