import { useState, useEffect } from 'react'
import { supabase, Database } from '@/lib/supabase'

type VoiceNote = Database['public']['Tables']['voice_notes']['Row'] & {
  user_profile?: {
    full_name: string | null
    role: string | null
    company: string | null
    verified: boolean | null
  }
  user_vote?: string | null
  is_saved?: boolean
  listen_count?: number
}

export function useVoiceNotes(filter: string = 'all', searchQuery: string = '') {
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const loadVoiceNotes = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get total count of non-deleted records
      const { count } = await supabase
        .from('voice_notes')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)

      setTotalCount(count || 0)

      // Build query based on filter, excluding deleted records
      let query = supabase
        .from('voice_notes')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(20)

      // Apply search filter
      if (searchQuery.trim()) {
        query = query.or(`action_text.ilike.%${searchQuery}%,tldr_text.ilike.%${searchQuery}%`)
      }

      // Apply filters based on original site categories
      if (filter === 'funny-light') {
        query = query.gt('humourous_count', 0)
      } else if (filter === 'deep-insights') {
        query = query.gt('thought_provoking_count', 0)
      } else if (filter === 'game-changer') {
        query = query.gt('game_changer_count', 0)
      } else if (filter === 'creative-spark') {
        query = query.gt('useful_count', 0) // Map to useful for now
      } else if (filter === 'aha-moments') {
        query = query.gt('informative_count', 0)
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
        .select('id, full_name, role, company, verified')
        .in('id', userIds)

      // Transform data to include user_profile and mock listen counts
      const transformedData = voiceNotesData.map((note, index) => ({
        ...note,
        user_profile: profiles?.find(p => p.id === note.user_id) || {
          full_name: null,
          role: null,
          company: null,
          verified: false
        },
        // Mock listen counts to match original site design
        listen_count: [149, 175, 199, 163, 128, 156, 142, 187, 134, 158, 171, 145, 192, 167, 139][index % 15] || 150
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
        console.log('User not logged in - reaction would require login')
        return
      }

      // 1. OPTIMISTIC UI UPDATE - increment counter immediately
      setVoiceNotes(prev => prev.map(note => {
        if (note.id === voiceNoteId) {
          const countField = `${voteType}_count` as keyof typeof note
          const currentCount = (note[countField] as number) || 0
          return {
            ...note,
            [countField]: currentCount + 1
          }
        }
        return note
      }))

      // 2. BACKEND CALL using handle-vote edge function
      const { data, error } = await supabase.functions.invoke('handle-vote', {
        body: { 
          voice_note_id: voiceNoteId, 
          vote_type: voteType 
        }
      })

      if (error) {
        console.error('Vote submission error:', error)
        // Revert optimistic update on error
        setVoiceNotes(prev => prev.map(note => {
          if (note.id === voiceNoteId) {
            const countField = `${voteType}_count` as keyof typeof note
            const currentCount = (note[countField] as number) || 0
            return {
              ...note,
              [countField]: Math.max(0, currentCount - 1)
            }
          }
          return note
        }))
        throw error
      }

      console.log('✅ Vote submitted successfully:', data)
    } catch (err) {
      console.error('Error adding reaction:', err)
    }
  }

  const toggleSave = async (voiceNoteId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('User not logged in - save would require login')
        return
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
  }, [filter, searchQuery])

  return {
    voiceNotes,
    loading,
    error,
    totalCount,
    addReaction,
    toggleSave,
    refresh: loadVoiceNotes
  }
}
