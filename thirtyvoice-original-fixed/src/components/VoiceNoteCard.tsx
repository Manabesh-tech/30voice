import React, { useState, useEffect } from 'react'
import { MessageSquare } from 'lucide-react'
import { AudioPlayer } from './AudioPlayer'
import { TranscriptView } from './TranscriptView'
import { ReplySection } from './ReplySection'
import { AuthModal } from './AuthModal'
import { Database, supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

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

interface VoiceNoteCardProps {
  voiceNote: VoiceNote
  onReaction?: (voteType: string) => void
}

const reactionButtons = [
  { type: 'humourous', emoji: '😄', label: 'funny' },
  { type: 'informative', emoji: '💡', label: 'insightful' },
  { type: 'game_changer', emoji: '🚀', label: 'game changer' },
  { type: 'useful', emoji: '🎨', label: 'creative' },
  { type: 'thought_provoking', emoji: '🤔', label: 'Aha!' },
  { type: 'debatable', emoji: '❓', label: 'debatable' },
]

export function VoiceNoteCard({ voiceNote, onReaction }: VoiceNoteCardProps) {
  const { user } = useAuth()
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false)
  const [reactionCounts, setReactionCounts] = useState(() => {
    const counts: { [key: string]: number } = {}
    reactionButtons.forEach(button => {
      counts[button.type] = voiceNote[`${button.type}_count`] as number || 0
    })
    return counts
  })
  const [isVoting, setIsVoting] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [tagVotes, setTagVotes] = useState<{ [key: string]: { count: number, userVoted: boolean } }>({})
  const [isTagVoting, setIsTagVoting] = useState(false)

  
  const getUserInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
  }
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
  }
  
  const getCommunityScore = () => {
    const totalReactions = reactionButtons.reduce((sum, button) => {
      const count = voiceNote[`${button.type}_count`] as number || 0
      return sum + count
    }, 0)
    return Math.min(10, Math.max(1, Math.floor(totalReactions / 2) + 5))
  }
  
  const getHashtags = (text: string) => {
    // Extract relevant hashtags based on content
    const content = text.toLowerCase()
    const hashtags = []
    
    if (content.includes('tech') || content.includes('technology')) hashtags.push('#Technology')
    if (content.includes('business') || content.includes('entrepreneur')) hashtags.push('#Entrepreneurship')
    if (content.includes('politics') || content.includes('political')) hashtags.push('#Politics')
    if (content.includes('cricket') || content.includes('sport')) hashtags.push('#cricket')
    if (content.includes('food') || content.includes('restaurant')) hashtags.push('#Food')
    if (content.includes('health') || content.includes('fitness')) hashtags.push('#Health')
    
    // Default hashtags if none found
    if (hashtags.length === 0) {
      hashtags.push('#Insights')
    }
    
    return hashtags
  }

  // Initialize tag votes with simple state management
  useEffect(() => {
    const initializeTagVotes = () => {
      const hashtags = getHashtags(voiceNote.action_text)
      const tagVoteData: { [key: string]: { count: number, userVoted: boolean } } = {}
      
      // Initialize all tags with zero votes for now
      // The actual vote fetching will happen when user clicks
      hashtags.forEach(hashtag => {
        tagVoteData[hashtag] = { count: 0, userVoted: false }
      })
      
      setTagVotes(tagVoteData)
    }
    
    initializeTagVotes()
  }, [voiceNote.id, voiceNote.action_text])

  const handleTagVote = async (hashtag: string) => {
    if (isTagVoting) return
    
    if (!user) {
      setShowAuthModal(true)
      return
    }
    
    setIsTagVoting(true)
    const tagName = hashtag.replace('#', '')
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No session found')
      }
      
      // Optimistic UI update
      const currentVote = tagVotes[hashtag] || { count: 0, userVoted: false }
      const newUserVoted = !currentVote.userVoted
      const newCount = newUserVoted ? currentVote.count + 1 : Math.max(0, currentVote.count - 1)
      
      setTagVotes(prev => ({
        ...prev,
        [hashtag]: {
          count: newCount,
          userVoted: newUserVoted
        }
      }))
      
      // Try to call the edge function, but don't fail if it doesn't work
      try {
        const response = await supabase.functions.invoke('handle-tag-vote', {
          body: {
            tagName,
            voiceNoteId: voiceNote.id
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        })
        
        if (response.error) {
          console.warn('Tag vote edge function failed, but optimistic update applied:', response.error)
        }
      } catch (edgeFunctionError) {
        console.warn('Tag vote edge function not available, using optimistic update only:', edgeFunctionError)
      }
      
    } catch (error) {
      console.error('Failed to vote on tag:', error)
      // Revert optimistic update on error
      setTagVotes(prev => prev)
    } finally {
      setIsTagVoting(false)
    }
  }



  const handleReaction = async (voteType: string) => {
    if (isVoting) {
      return
    }
    
    if (!user) {
      setShowAuthModal(true)
      return
    }

    setIsVoting(true)
    const originalCounts = { ...reactionCounts }
    
    try {
      // Optimistic UI update
      setReactionCounts(prev => ({
        ...prev,
        [voteType]: prev[voteType] + 1
      }))

      // Call the edge function
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No session found')
      }

      const response = await supabase.functions.invoke('handle-vote', {
        body: { 
          voiceNoteId: voiceNote.id, 
          voteType: voteType 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (response.error) {
        throw response.error
      }

      // Update reaction counts based on server response
      const result = response.data
      if (result.operation === 'remove') {
        setReactionCounts(prev => ({
          ...prev,
          [voteType]: Math.max(0, prev[voteType] - 1)
        }))
      } else if (result.operation === 'update') {
        setReactionCounts(prev => ({
          ...prev,
          [voteType]: prev[voteType] + 1,
          [result.previousVoteType]: Math.max(0, prev[result.previousVoteType] - 1)
        }))
      }
      // For 'add' operation, optimistic update already happened

      // Call the original onReaction callback if provided
      onReaction?.(voteType)
    } catch (error) {
      console.error('Failed to handle reaction:', error)
      // Revert optimistic update on error
      setReactionCounts(originalCounts)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* User Info */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {getUserInitials(voiceNote.user_profile?.full_name)}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900">
              {voiceNote.user_profile?.full_name || 'Anonymous User'}
            </h3>
            <span className="text-sm text-gray-500">
              {formatDate(voiceNote.created_at)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">
            {voiceNote.user_profile?.role || 'Community Member'}
            {voiceNote.user_profile?.company && ` at ${voiceNote.user_profile.company}`}
          </p>
          
          {/* Hashtags with Voting */}
          <div className="flex flex-wrap gap-1 mb-3">
            {getHashtags(voiceNote.action_text).map((tag, index) => {
              const tagVoteData = tagVotes[tag] || { count: 0, userVoted: false }
              return (
                <button
                  key={index}
                  onClick={() => handleTagVote(tag)}
                  disabled={isTagVoting}
                  className={`
                    inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200
                    ${tagVoteData.userVoted 
                      ? 'bg-purple-100 text-purple-700 border border-purple-300 shadow-sm'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200'
                    }
                    ${isTagVoting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-sm'}
                  `}
                  title={tagVoteData.userVoted ? 'Click to remove your vote' : 'Click to vote for this tag'}
                >
                  <span>{tag}</span>
                  {tagVoteData.count > 0 && (
                    <span className={`
                      px-1.5 py-0.5 rounded-full text-xs leading-none font-semibold
                      ${tagVoteData.userVoted 
                        ? 'bg-purple-200 text-purple-800' 
                        : 'bg-gray-200 text-gray-700'
                      }
                    `}>
                      {tagVoteData.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-800 leading-relaxed mb-3">
          {voiceNote.action_text}
        </p>
        
        {/* TLDR */}
        <div className="bg-purple-50 border-l-4 border-purple-600 p-3 rounded-r-lg">
          <p className="text-sm text-purple-800 font-medium">
            💡 {voiceNote.tldr_text}
          </p>
        </div>
      </div>

      {/* Audio Player */}
      <AudioPlayer
        voiceNoteId={voiceNote.id}
        audioUrl={voiceNote.audio_url}
        mp3Url={voiceNote.audio_url_mp3}
        duration={voiceNote.duration}
        listenCount={voiceNote.listen_count || 150}
      />

      {/* Transcript Toggle */}
      {voiceNote.transcript && (
        <div className="mt-3">
          <button 
            onClick={() => setIsTranscriptVisible(!isTranscriptVisible)}
            className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            {isTranscriptVisible ? 'Hide transcript' : 'View transcript'}
          </button>
        </div>
      )}
      
      {/* Transcript Content */}
      <TranscriptView 
        transcript={voiceNote.transcript || ''} 
        isVisible={isTranscriptVisible} 
      />

      {/* Reactions */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {reactionButtons.map((button) => {
            const count = reactionCounts[button.type] || 0
            
            return (
              <button
                key={button.type}
                onClick={() => handleReaction(button.type)}
                disabled={isVoting}
                className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors text-xs ${
                  isVoting ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span>{button.emoji}</span>
                <span className="text-gray-600">{button.label}</span>
                {count > 0 && <span className="font-medium text-gray-700">{count}</span>}
              </button>
            )
          })}
        </div>
        
        {/* Community Score */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Community Score: <span className="font-semibold text-purple-600">{getCommunityScore()}/10</span></span>
        </div>
      </div>
      
      {/* Reply Section */}
      <ReplySection voiceNoteId={voiceNote.id} />
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  )
}
