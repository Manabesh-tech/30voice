-- Migration: add_listen_count_to_voice_notes
-- Created at: 1754122526

ALTER TABLE voice_notes ADD COLUMN listen_count INTEGER DEFAULT 0;;