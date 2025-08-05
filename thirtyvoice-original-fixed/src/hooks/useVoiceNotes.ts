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

      // Get total count
      const { count } = await supabase
        .from('voice_notes')
        .select('*', { count: 'exact', head: true })

      setTotalCount(count || 0)

      // Build query based on filter
      let query = supabase
        .from('voice_notes')
        .select('*')
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

      // Fetch actual listen counts from database by aggregating listen_counts table
      const voiceNoteIds = voiceNotesData.map(note => note.id)
      const { data: listenCountsData } = await supabase
        .from('listen_counts')
        .select('voice_note_id')
        .in('voice_note_id', voiceNoteIds)

      // Count listens per voice note
      const listenCountsByNoteId = (listenCountsData || []).reduce((acc, count) => {
        acc[count.voice_note_id] = (acc[count.voice_note_id] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Transform data to include user_profile and real listen counts
      const transformedData = voiceNotesData.map((note) => ({
        ...note,
        user_profile: profiles?.find(p => p.id === note.user_id) || {
          full_name: null,
          role: null,
          company: null,
          verified: false
        },
        // Use actual database aggregated count, fallback to note's count or 0
        listen_count: listenCountsByNoteId[note.id] || note.listen_count || 0
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
