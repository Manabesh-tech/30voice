-- Migration: add_mp3_audio_support
-- Created at: 1754118507

ALTER TABLE voice_notes 
ADD COLUMN audio_url_mp3 TEXT;;