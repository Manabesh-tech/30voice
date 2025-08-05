-- Migration: create_reply_tables
-- Created at: 1754359969

-- Create voice_note_replies table
CREATE TABLE voice_note_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voice_note_id UUID NOT NULL REFERENCES voice_notes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reply_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create voice_note_tags table
CREATE TABLE voice_note_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voice_note_id UUID NOT NULL REFERENCES voice_notes(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback table
CREATE TABLE feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    voice_note_id UUID REFERENCES voice_notes(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE voice_note_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for voice_note_replies
CREATE POLICY "Replies are viewable by everyone" ON voice_note_replies
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own replies" ON voice_note_replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replies" ON voice_note_replies
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for voice_note_tags  
CREATE POLICY "Tags are viewable by everyone" ON voice_note_tags
  FOR SELECT USING (true);

CREATE POLICY "Users can insert tags" ON voice_note_tags
  FOR INSERT WITH CHECK (true);

-- Create policies for feedback
CREATE POLICY "Users can view all feedback" ON feedback
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" ON feedback
  FOR UPDATE USING (auth.uid() = user_id);;