-- Migration: create_feedback_table
-- Created at: 1754124710

-- Create feedback table for real feedback submission
CREATE TABLE IF NOT EXISTS feedback_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('general', 'bug', 'feature')),
    message TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
    admin_notes TEXT
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_feedback_submissions_created_at ON feedback_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_submissions_status ON feedback_submissions(status);

-- Enable RLS
ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting feedback (anyone can submit feedback)
CREATE POLICY "Anyone can submit feedback" ON feedback_submissions
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- Create policy for viewing feedback (only admins or the submitter)
CREATE POLICY "Users can view their own feedback" ON feedback_submissions
    FOR SELECT 
    TO authenticated
    USING (user_id = auth.uid());;