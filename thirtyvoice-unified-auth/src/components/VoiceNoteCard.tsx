import React, { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { AudioPlayer } from './AudioPlayer'
import { TranscriptView } from './TranscriptView'
import { ReplySection } from './ReplySection'
import { DeleteButton } from './DeleteButton'
import { useAuth } from '@/contexts/AuthContext'
import { Database } from '@/lib/supabase'

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
  onDelete?: () => void
}

const reactionButtons = [
  { type: 'humourous', emoji: '😄', label: 'funny' },
  { type: 'informative', emoji: '💡', label: 'insightful' },
  { type: 'game_changer', emoji: '🚀', label: 'game changer' },
  { type: 'useful', emoji: '🎨', label: 'creative' },
  { type: 'thought_provoking', emoji: '🤔', label: 'Aha!' },
  { type: 'debatable', emoji: '❓', label: 'debatable' },
]

export function VoiceNoteCard({ voiceNote, onReaction, onDelete }: VoiceNoteCardProps) {
  const { user } = useAuth()
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false)
  const [currentListenCount, setCurrentListenCount] = useState(voiceNote.listen_count || 150)
  
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {formatDate(voiceNote.created_at)}
              </span>
              {user && user.id === voiceNote.user_id && (
                <DeleteButton
                  type="voice-note"
                  itemId={voiceNote.id}
                  onDelete={() => onDelete?.()}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">
            {voiceNote.user_profile?.role || 'Community Member'}
            {voiceNote.user_profile?.company && ` at ${voiceNote.user_profile.company}`}
          </p>
          
          {/* Hashtags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {getHashtags(voiceNote.action_text).map((tag, index) => (
              <span key={index} className="text-xs text-gray-500 hover:text-purple-600 cursor-pointer">
                {tag}
              </span>
            ))}
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
        duration={voiceNote.duration}
        listenCount={currentListenCount}
        onListenCountUpdate={setCurrentListenCount}
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
            const count = voiceNote[`${button.type}_count`] as number || 0
            
            return (
              <button
                key={button.type}
                onClick={() => onReaction?.(button.type)}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-xs"
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
          <span className="flex items-center gap-1">
            Community Score: 
            <span className="font-semibold text-purple-600">{getCommunityScore()}/10</span>
            <span 
              className="text-gray-400 hover:text-gray-600 cursor-help" 
              title="Community Score is calculated based on engagement: (Total Reactions / 2) + 5, representing how the community values this content out of 10"
            >
              (?)
            </span>
          </span>
        </div>
      </div>
      
      {/* Reply Section */}
      <ReplySection voiceNoteId={voiceNote.id} />
    </div>
  )
}
