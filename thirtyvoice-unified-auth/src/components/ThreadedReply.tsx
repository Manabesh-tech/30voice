import React, { useState, useEffect } from 'react'
import { MessageSquare, Play, Pause, MoreHorizontal } from 'lucide-react'
import { supabase, Database } from '@/lib/supabase'
import { ReplyForm } from './ReplyForm'
import { DeleteButton } from './DeleteButton'
import { useAuth } from '@/contexts/AuthContext'
import { useAudio } from '@/contexts/AudioContext'

type Reply = Database['public']['Tables']['voice_note_replies']['Row'] & {
  user_profile?: {
    full_name: string | null
    role: string | null
    company: string | null
    verified: boolean | null
  }
  replies?: Reply[] // Nested replies
}

interface ThreadedReplyProps {
  reply: Reply
  voiceNoteId: string
  level?: number // Indentation level (0 = top level)
  onReplyAdded: () => void
}

export function ThreadedReply({ reply, voiceNoteId, level = 0, onReplyAdded }: ThreadedReplyProps) {
  const { user } = useAuth()
  const { audioState, playTrack, pauseTrack } = useAudio()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [childReplies, setChildReplies] = useState<Reply[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [showAllReplies, setShowAllReplies] = useState(false)

  const maxIndentLevel = 3 // Limit nesting to prevent UI issues
  const indentLevel = Math.min(level, maxIndentLevel)
  const indentWidth = indentLevel * 40 // 40px per level

  // Load child replies for this reply
  const loadChildReplies = async () => {
    setLoadingReplies(true)
    try {
      const { data: replies, error } = await supabase
        .from('voice_note_replies')
        .select('*')
        .eq('parent_id', reply.id)
        .eq('is_deleted', false) // Exclude deleted replies
        .order('created_at', { ascending: true })

      if (error) throw error

      if (replies && replies.length > 0) {
        // Fetch user profiles for the replies
        const userIds = [...new Set(replies.map(r => r.user_id))]
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, full_name, role, company, verified')
          .in('id', userIds)

        const repliesWithProfiles = replies.map(reply => ({
          ...reply,
          user_profile: profiles?.find(p => p.id === reply.user_id) || {
            full_name: null,
            role: null,
            company: null,
            verified: false
          }
        }))

        setChildReplies(repliesWithProfiles)
      }
    } catch (error) {
      console.error('Error loading child replies:', error)
    } finally {
      setLoadingReplies(false)
    }
  }

  // Load child replies on mount
  useEffect(() => {
    loadChildReplies()
  }, [reply.id])

  const handleReplySubmitted = () => {
    setShowReplyForm(false)
    loadChildReplies() // Reload child replies
    onReplyAdded() // Notify parent to reload
  }

  const handlePlayAudio = () => {
    if (!reply.audio_url) return

    if (audioState.currentTrackId === reply.id && audioState.isPlaying) {
      pauseTrack()
    } else {
      playTrack(reply.id, reply.audio_url)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  const visibleReplies = showAllReplies ? childReplies : childReplies.slice(0, 2)
  const hasMoreReplies = childReplies.length > 2

  return (
    <div className="relative">
      {/* Connector line for nested replies */}
      {level > 0 && (
        <div 
          className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300"
          style={{ left: `${indentLevel * 40 - 20}px` }}
        />
      )}
      
      {/* Main reply content */}
      <div 
        className="bg-white rounded-lg border border-gray-200 p-4 mb-3 shadow-sm group"
        style={{ marginLeft: `${indentWidth}px` }}
      >
        {/* Reply header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-purple-600">
                {reply.user_profile?.full_name?.[0] || 'U'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {reply.user_profile?.full_name || 'Anonymous User'}
                </span>
                {reply.user_profile?.verified && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                )}
              </div>
              {reply.user_profile?.role && (
                <p className="text-sm text-gray-600">
                  {reply.user_profile.role}{reply.user_profile.company && ` at ${reply.user_profile.company}`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {formatDate(reply.created_at || '')}
            </span>
            {user && user.id === reply.user_id && (
              <DeleteButton
                type="reply"
                itemId={reply.id}
                onDelete={() => onReplyAdded()}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            )}
          </div>
        </div>

        {/* Reply content */}
        {reply.content_type === 'voice' && reply.audio_url ? (
          <div className="mb-3">
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
              <button
                onClick={handlePlayAudio}
                className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-colors"
              >
                {audioState.currentTrackId === reply.id && audioState.isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5" />
                )}
              </button>
              <div>
                <p className="text-sm font-medium text-gray-900">Voice Reply</p>
                <p className="text-xs text-gray-500">
                  {reply.duration ? `${reply.duration}s` : 'Duration unknown'}
                </p>
              </div>
            </div>
          </div>
        ) : reply.text_content ? (
          <div className="mb-3">
            <p className="text-gray-800 leading-relaxed">{reply.text_content}</p>
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-gray-500 italic">No content available</p>
          </div>
        )}

        {/* Reply actions */}
        <div className="flex items-center gap-4">
          {user && level < maxIndentLevel && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
            >
              <MessageSquare className="w-4 h-4" />
              Reply
            </button>
          )}
          {childReplies.length > 0 && (
            <span className="text-sm text-gray-500">
              {childReplies.length} {childReplies.length === 1 ? 'reply' : 'replies'}
            </span>
          )}
        </div>

        {/* Reply form */}
        {showReplyForm && (
          <ReplyForm
            voiceNoteId={voiceNoteId}
            parentId={reply.id}
            onReplySubmitted={handleReplySubmitted}
            onCancel={() => setShowReplyForm(false)}
          />
        )}
      </div>

      {/* Child replies */}
      {childReplies.length > 0 && (
        <div className="space-y-2">
          {visibleReplies.map((childReply) => (
            <ThreadedReply
              key={childReply.id}
              reply={childReply}
              voiceNoteId={voiceNoteId}
              level={level + 1}
              onReplyAdded={onReplyAdded}
            />
          ))}
          
          {hasMoreReplies && !showAllReplies && (
            <div style={{ marginLeft: `${(level + 1) * 40}px` }}>
              <button
                onClick={() => setShowAllReplies(true)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Show {childReplies.length - 2} more replies
              </button>
            </div>
          )}
          
          {hasMoreReplies && showAllReplies && (
            <div style={{ marginLeft: `${(level + 1) * 40}px` }}>
              <button
                onClick={() => setShowAllReplies(false)}
                className="text-sm text-gray-600 hover:text-gray-700"
              >
                Show fewer replies
              </button>
            </div>
          )}
        </div>
      )}
      
      {loadingReplies && (
        <div className="text-center py-2" style={{ marginLeft: `${(level + 1) * 40}px` }}>
          <div className="text-sm text-gray-500">Loading replies...</div>
        </div>
      )}
    </div>
  )
}
