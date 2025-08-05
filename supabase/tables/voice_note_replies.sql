CREATE TABLE voice_note_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voice_note_id UUID NOT NULL,
    user_id UUID NOT NULL,
    reply_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);