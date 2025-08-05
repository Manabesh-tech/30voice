import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bjtjobxqqnngvponbuek.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdGpvYnhxcW5uZ3Zwb25idWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MTU3NzgsImV4cCI6MjA2OTA5MTc3OH0.YNv7FmzZ2S02_fy8t7VggUEz6vR7jcgpzSDb45i1Um4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      voice_notes: {
        Row: {
          id: string
          user_id: string
          audio_url: string
          audio_url_mp3: string | null
          duration: number
          tldr_text: string
          action_text: string
          transcript: string | null
          created_at: string | null
          save_count: number | null
          implementation_count: number | null
          game_changer_count: number | null
          useful_count: number | null
          informative_count: number | null
          low_quality_count: number | null
          humourous_count: number
          thought_provoking_count: number | null
          debatable_count: number | null
        }
        Insert: {
          id?: string
          user_id: string
          audio_url: string
          audio_url_mp3?: string | null
          duration: number
          tldr_text: string
          action_text: string
          transcript?: string | null
          created_at?: string | null
          save_count?: number | null
          implementation_count?: number | null
          game_changer_count?: number | null
          useful_count?: number | null
          informative_count?: number | null
          low_quality_count?: number | null
          humourous_count?: number
          thought_provoking_count?: number | null
          debatable_count?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          audio_url?: string
          audio_url_mp3?: string | null
          duration?: number
          tldr_text?: string
          action_text?: string
          transcript?: string | null
          created_at?: string | null
          save_count?: number | null
          implementation_count?: number | null
          game_changer_count?: number | null
          useful_count?: number | null
          informative_count?: number | null
          low_quality_count?: number | null
          humourous_count?: number
          thought_provoking_count?: number | null
          debatable_count?: number | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          role: string | null
          company: string | null
          verified: boolean | null
          created_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: string | null
          company?: string | null
          verified?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: string | null
          company?: string | null
          verified?: boolean | null
          created_at?: string | null
        }
      }
      voice_note_votes: {
        Row: {
          id: string
          user_id: string
          voice_note_id: string
          vote_type: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          voice_note_id: string
          vote_type: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          voice_note_id?: string
          vote_type?: string
          created_at?: string | null
        }
      }
      voice_note_saves: {
        Row: {
          id: string
          user_id: string
          voice_note_id: string
          implemented: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          voice_note_id: string
          implemented?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          voice_note_id?: string
          implemented?: boolean | null
          created_at?: string | null
        }
      }
    }
  }
}
