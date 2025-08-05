import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bjtjobxqqnngvponbuek.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdGpvYnhxcW5uZ3Zwb25idWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MTU3NzgsImV4cCI6MjA2OTA5MTc3OH0.YNv7FmzZ2S02_fy8t7VggUEz6vR7jcgpzSDb45i1Um4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for the database
export interface VoiceNote {
  id: string
  created_at: string
  transcript: string | null
  audio_url: string
  listen_count: number
  user_id: string
  user_profiles?: {
    full_name: string
    role: string | null
    company: string | null
  }
  voice_note_votes?: Array<{
    vote_type: string
    user_id: string
  }>
  voice_note_replies?: Array<{
    id: string
    content: string
    created_at: string
    user_profiles?: {
      full_name: string
    }
  }>
}

export interface UserProfile {
  id: string
  full_name: string
  role: string | null
  company: string | null
  verified: boolean
  created_at: string
}