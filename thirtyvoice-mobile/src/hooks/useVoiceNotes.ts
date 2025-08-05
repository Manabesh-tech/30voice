import { useState, useEffect } from 'react'
import { supabase, Database } from '@/lib/supabase'

type VoiceNote = Database['public']['Tables']['voice_notes']['Row'] & {
  user_profile?: {
    full_name: string | null
    role: string | null
    verified: boolean | null
  }
  user_vote?: string | null
  is_saved?: boolean
}

export function useVoiceNotes(filter: string = 'all') {
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadVoiceNotes = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query based on filter
      let query = supabase
        .from('voice_notes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      // Apply filters
      if (filter === 'funny') {
        query = query.gt('humourous_count', 0)
      } else if (filter === 'deep') {
        query = query.gt('thought_provoking_count', 0)
      } else if (filter === 'practical') {
        query = query.gt('useful_count', 0)
      } else if (filter === 'trending') {
        // Sort by total reactions in last 24 hours
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        query = query.gte('created_at', yesterday.toISOString())
      }

      const { data: voiceNotesData, error: queryError } = await query

      if (queryError) {
        throw queryError
      }

      if (!voiceNotesData || voiceNotesData.length === 0) {
        setVoiceNotes([])
        return
      }

      // Manually fetch user profiles
      const userIds = [...new Set(voiceNotesData.map(note => note.user_id))]
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, full_name, role, verified')
        .in('id', userIds)

      // Transform data to include user_profile as nested object
      const transformedData = voiceNotesData.map(note => ({
        ...note,
        user_profile: profiles?.find(p => p.id === note.user_id) || {
          full_name: null,
          role: null,
          verified: false
        }
      }))

      setVoiceNotes(transformedData)
    } catch (err) {
      console.error('Error loading voice notes:', err)
      setError(err instanceof Error ? err.message : 'Failed to load voice notes')
    } finally {
      setLoading(false)
    }
  }

  const addReaction = async (voiceNoteId: string, voteType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Must be logged in to react')
      }

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('voice_note_votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('voice_note_id', voiceNoteId)
        .maybeSingle()

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if same type
          await supabase
            .from('voice_note_votes')
            .delete()
            .eq('id', existingVote.id)
        } else {
          // Update vote type
          await supabase
            .from('voice_note_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id)
        }
      } else {
        // Add new vote
        await supabase
          .from('voice_note_votes')
          .insert({
            user_id: user.id,
            voice_note_id: voiceNoteId,
            vote_type: voteType
          })
      }

      // Reload to update counts
      await loadVoiceNotes()
    } catch (err) {
      console.error('Error adding reaction:', err)
    }
  }

  const toggleSave = async (voiceNoteId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Must be logged in to save')
      }

      const { data: existingSave } = await supabase
        .from('voice_note_saves')
        .select('*')
        .eq('user_id', user.id)
        .eq('voice_note_id', voiceNoteId)
        .maybeSingle()

      if (existingSave) {
        await supabase
          .from('voice_note_saves')
          .delete()
          .eq('id', existingSave.id)
      } else {
        await supabase
          .from('voice_note_saves')
          .insert({
            user_id: user.id,
            voice_note_id: voiceNoteId
          })
      }

      // Update local state
      setVoiceNotes(prev => prev.map(note => 
        note.id === voiceNoteId 
          ? { ...note, is_saved: !note.is_saved }
          : note
      ))
    } catch (err) {
      console.error('Error toggling save:', err)
    }
  }

  useEffect(() => {
    loadVoiceNotes()
  }, [filter])

  return {
    voiceNotes,
    loading,
    error,
    addReaction,
    toggleSave,
    refresh: loadVoiceNotes
  }
}
