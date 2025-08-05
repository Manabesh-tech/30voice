export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
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
        Relationships: []
      }
      product_feedback: {
        Row: {
          created_at: string | null
          feedback: string
          id: string
          rating: number
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          feedback: string
          id?: string
          rating: number
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          feedback?: string
          id?: string
          rating?: number
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
      user_votes: {
        Row: {
          created_at: string | null
          id: string
          recording_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          recording_id: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          recording_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "voice_note_saves_voice_note_id_fkey"
            columns: ["voice_note_id"]
            isOneToOne: false
            referencedRelation: "voice_notes"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "voice_note_votes_voice_note_id_fkey"
            columns: ["voice_note_id"]
            isOneToOne: false
            referencedRelation: "voice_notes"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

