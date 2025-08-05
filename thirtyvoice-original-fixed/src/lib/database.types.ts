export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      listen_counts: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown | null
          session_id: string | null
          user_id: string | null
          voice_note_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_id?: string | null
          voice_note_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_id?: string | null
          voice_note_id?: string
        }
      }
      user_profiles: {
        Row: {
          company: string | null
          created_at: string | null
          full_name: string | null
          id: string
          role: string | null
          verified: boolean | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          verified?: boolean | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          verified?: boolean | null
        }
      }
      voice_note_replies: {
        Row: {
          audio_url: string | null
          audio_url_mp3: string | null
          content_type: string | null
          created_at: string | null
          duration: number | null
          id: string
          reply_text: string | null
          text_content: string | null
          user_id: string
          voice_note_id: string
        }
        Insert: {
          audio_url?: string | null
          audio_url_mp3?: string | null
          content_type?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          reply_text?: string | null
          text_content?: string | null
          user_id: string
          voice_note_id: string
        }
        Update: {
          audio_url?: string | null
          audio_url_mp3?: string | null
          content_type?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          reply_text?: string | null
          text_content?: string | null
          user_id?: string
          voice_note_id?: string
        }
      }
      voice_note_saves: {
        Row: {
          created_at: string | null
          id: string
          implemented: boolean | null
          user_id: string
          voice_note_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          implemented?: boolean | null
          user_id: string
          voice_note_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          implemented?: boolean | null
          user_id?: string
          voice_note_id?: string
        }
      }
      voice_note_tags: {
        Row: {
          created_at: string | null
          id: string
          tag_name: string
          voice_note_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          tag_name: string
          voice_note_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          tag_name?: string
          voice_note_id?: string
        }
      }
      voice_note_votes: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
          voice_note_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
          voice_note_id: string
          vote_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
          voice_note_id?: string
          vote_type?: string
        }
      }
      voice_notes: {
        Row: {
          action_text: string
          audio_url: string
          audio_url_mp3: string | null
          created_at: string | null
          debatable_count: number | null
          duration: number
          game_changer_count: number | null
          humourous_count: number
          id: string
          implementation_count: number | null
          informative_count: number | null
          listen_count: number | null
          low_quality_count: number | null
          save_count: number | null
          thought_provoking_count: number | null
          tldr_text: string
          transcript: string | null
          useful_count: number | null
          user_id: string
        }
        Insert: {
          action_text: string
          audio_url: string
          audio_url_mp3?: string | null
          created_at?: string | null
          debatable_count?: number | null
          duration: number
          game_changer_count?: number | null
          humourous_count?: number
          id?: string
          implementation_count?: number | null
          informative_count?: number | null
          listen_count?: number | null
          low_quality_count?: number | null
          save_count?: number | null
          thought_provoking_count?: number | null
          tldr_text: string
          transcript?: string | null
          useful_count?: number | null
          user_id: string
        }
        Update: {
          action_text?: string
          audio_url?: string
          audio_url_mp3?: string | null
          created_at?: string | null
          debatable_count?: number | null
          duration?: number
          game_changer_count?: number | null
          humourous_count?: number
          id?: string
          implementation_count?: number | null
          informative_count?: number | null
          listen_count?: number | null
          low_quality_count?: number | null
          save_count?: number | null
          thought_provoking_count?: number | null
          tldr_text?: string
          transcript?: string | null
          useful_count?: number | null
          user_id?: string
        }
      }
    }
  }
}
