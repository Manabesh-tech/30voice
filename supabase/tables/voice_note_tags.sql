CREATE TABLE voice_note_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voice_note_id UUID NOT NULL,
    tag_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);