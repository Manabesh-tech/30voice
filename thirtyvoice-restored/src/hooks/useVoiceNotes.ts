import { useState, useEffect } from 'react'
import { supabase, VoiceNote } from '@/lib/supabase'

export function useVoiceNotes() {
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const fetchVoiceNotes = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch voice notes with related data - using REAL database query
      const { data, error: fetchError } = await supabase
        .from('voice_notes')
        .select(`
          id,
          created_at,
          transcript,
          audio_url,
          listen_count,
          user_id,
          user_profiles!voice_notes_user_id_fkey (
            full_name,
            role,
            company
          ),
          voice_note_votes (
            vote_type,
            user_id
          ),
          voice_note_replies (
            id,
            content,
            created_at,
            user_profiles!voice_note_replies_user_id_fkey (
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) {
        console.error('Error fetching voice notes:', fetchError)
        setError(fetchError.message)
        return
      }

      // Transform the data to match our interface
      const transformedData = (data || []).map(note => ({
        ...note,
        voice_note_votes: note.voice_note_votes || [],
        voice_note_replies: note.voice_note_replies || []
      }))

      setVoiceNotes(transformedData)
      setTotalCount(transformedData.length)
    } catch (err: any) {
      console.error('Unexpected error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVoiceNotes()
  }, [])

  return {
    voiceNotes,
    loading,
    error,
    totalCount,
    refresh: fetchVoiceNotes
  }
}