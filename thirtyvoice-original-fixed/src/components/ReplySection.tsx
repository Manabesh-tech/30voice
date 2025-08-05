import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Database } from '@/lib/supabase'
import { ReplyForm } from './ReplyForm'
import { ReplyCard } from './ReplyCard'
import { AuthModal } from './AuthModal'

type Reply = Database['public']['Tables']['voice_note_replies']['Row'] & {
  user_profile?: {
    full_name: string | null
    role: string | null
  }
}

interface ReplySectionProps {
  voiceNoteId: string
}

export function ReplySection({ voiceNoteId }: ReplySectionProps) {
  const { user } = useAuth()
  const [replies, setReplies] = useState<Reply[]>([])
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadReplies()
  }, [voiceNoteId])

  const loadReplies = async () => {
    try {
      setLoading(true)
      setError('')

      const { data: repliesData, error: queryError } = await supabase
        .from('voice_note_replies')
        .select('*')
        .eq('voice_note_id', voiceNoteId)
        .order('created_at', { ascending: true })

      if (queryError) throw queryError

      if (!repliesData || repliesData.length === 0) {
        setReplies([])
        return
      }

      // Fetch user profiles for replies
      const userIds = [...new Set(repliesData.map(reply => reply.user_id))]
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, full_name, role')
        .in('id', userIds)

      // Combine replies with user profiles
      const repliesWithProfiles = repliesData.map(reply => ({
        ...reply,
        user_profile: profiles?.find(p => p.id === reply.user_id) || {
          full_name: null,
          role: null
        }
      }))

      setReplies(repliesWithProfiles)
    } catch (err: any) {
      console.error('Error loading replies:', err)
      setError('Failed to load replies')
    } finally {
      setLoading(false)
    }
  }

  const handleReplyClick = () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    setShowReplyForm(true)
  }

  const handleReplySubmitted = () => {
    setShowReplyForm(false)
    loadReplies() // Refresh replies
  }

  const handleCancel = () => {
    setShowReplyForm(false)
  }

  if (loading) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading replies...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mt-4 pt-4 border-t border-gray-100">
        {/* Replies Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-700">
            {replies.length === 0 ? 'No replies yet' : `${replies.length} ${replies.length === 1 ? 'Reply' : 'Replies'}`}
          </h4>
          
          {!showReplyForm && (
            <button
              onClick={handleReplyClick}
              className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
            >
              Reply
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Reply Form */}
        {showReplyForm && (
          <ReplyForm
            voiceNoteId={voiceNoteId}
            onReplySubmitted={handleReplySubmitted}
            onCancel={handleCancel}
          />
        )}

        {/* Replies List */}
        {replies.length > 0 && (
          <div className="space-y-3 mt-4">
            {replies.map((reply) => (
              <ReplyCard key={reply.id} reply={reply} />
            ))}
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}
