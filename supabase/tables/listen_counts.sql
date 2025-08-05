CREATE TABLE listen_counts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voice_note_id UUID NOT NULL,
    user_id UUID,
    ip_address INET,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);