import React, { useState } from 'react'
import { MessageSquare, Clock, Play, Heart, Brain, Zap, ThumbsUp, MessageCircle, Lightbulb, Bookmark, BookmarkCheck } from 'lucide-react'
import { AudioPlayer } from './AudioPlayer'
import { useAudio } from '@/contexts/AudioContext'
import { Database } from '@/lib/supabase'

type VoiceNote = Database['public']['Tables']['voice_notes']['Row'] & {
  user_profile?: {
    full_name: string | null
    role: string | null
    verified: boolean | null
  }
  user_vote?: string | null
  is_saved?: boolean
}

interface VoiceNoteCardProps {
  voiceNote: VoiceNote
  onReaction?: (voteType: string) => void
  onSave?: () => void
  onViewTranscript?: () => void
}

const reactionButtons = [
  { type: 'humourous', icon: Heart, label: 'Funny', color: 'text-pink-400 hover:text-pink-300' },
  { type: 'informative', icon: Lightbulb, label: 'Insightful', color: 'text-blue-400 hover:text-blue-300' },
  { type: 'game_changer', icon: Zap, label: 'Game Changer', color: 'text-yellow-400 hover:text-yellow-300' },
  { type: 'useful', icon: ThumbsUp, label: 'Useful', color: 'text-green-400 hover:text-green-300' },
  { type: 'thought_provoking', icon: Brain, label: 'Deep', color: 'text-purple-400 hover:text-purple-300' },
  { type: 'debatable', icon: MessageCircle, label: 'Debatable', color: 'text-orange-400 hover:text-orange-300' },
]

export function VoiceNoteCard({ voiceNote, onReaction, onSave, onViewTranscript }: VoiceNoteCardProps) {
  const { audioState } = useAudio()
  const [showFullText, setShowFullText] = useState(false)
  
  const isCurrentTrack = audioState.currentTrackId === voiceNote.id
  const showPlayer = isCurrentTrack || audioState.currentTrackId === null
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getVibeColor = (text: string) => {
    const lower = text.toLowerCase()
    if (lower.includes('funny') || lower.includes('light')) return 'bg-pink-500/20 text-pink-300 border-pink-500/30'
    if (lower.includes('deep') || lower.includes('insight')) return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    if (lower.includes('practical') || lower.includes('useful')) return 'bg-green-500/20 text-green-300 border-green-500/30'
    return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  }

  const totalReactions = reactionButtons.reduce((sum, button) => {
    const count = voiceNote[`${button.type}_count`] as number || 0
    return sum + count
  }, 0)

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 space-y-4 shadow-xl">
      {/* User Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {voiceNote.user_profile?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-100">
                {voiceNote.user_profile?.full_name || 'Anonymous'}
              </h3>
              {voiceNote.user_profile?.verified && (
                <div className="w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </div>
            {voiceNote.user_profile?.role && (
              <p className="text-sm text-gray-400">{voiceNote.user_profile.role}</p>
            )}
          </div>
        </div>
        
        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(voiceNote.duration)}</span>
          </div>
        </div>
      </div>

      {/* Vibe Tag */}
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getVibeColor(voiceNote.tldr_text)}`}>
          {voiceNote.tldr_text.length > 30 ? `${voiceNote.tldr_text.substring(0, 30)}...` : voiceNote.tldr_text}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div>
          <p className="text-gray-200 leading-relaxed">
            {showFullText || voiceNote.action_text.length <= 120
              ? voiceNote.action_text
              : `${voiceNote.action_text.substring(0, 120)}...`}
          </p>
          {voiceNote.action_text.length > 120 && (
            <button
              onClick={() => setShowFullText(!showFullText)}
              className="text-teal-400 hover:text-teal-300 text-sm mt-2 transition-colors"
            >
              {showFullText ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      </div>

      {/* Audio Player */}
      {(!isCurrentTrack || audioState.currentTrackId === voiceNote.id) && (
        <AudioPlayer
          voiceNoteId={voiceNote.id}
          audioUrl={voiceNote.audio_url}
          mp3Url={voiceNote.audio_url_mp3}
          duration={voiceNote.duration}
        />
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        {/* Reactions */}
        <div className="flex flex-wrap items-center gap-2">
          {reactionButtons.map((button) => {
            const count = voiceNote[`${button.type}_count`] as number || 0
            const isActive = voiceNote.user_vote === button.type
            const Icon = button.icon
            
            return (
              <button
                key={button.type}
                onClick={() => onReaction?.(button.type)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? `${button.color} bg-current/10`
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                } min-h-[32px]`}
                aria-label={`${button.label} (${count})`}
              >
                <Icon className="w-3.5 h-3.5" />
                {count > 0 && <span>{count}</span>}
              </button>
            )
          })}
        </div>

        {/* Secondary Actions */}
        <div className="flex items-center gap-3">
          {voiceNote.transcript && (
            <button
              onClick={onViewTranscript}
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Transcript
            </button>
          )}
          
          <button
            onClick={onSave}
            className={`flex items-center gap-1 text-sm transition-colors ${
              voiceNote.is_saved
                ? 'text-teal-400 hover:text-teal-300'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {voiceNote.is_saved ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
            Save
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-700/50">
        <span>{totalReactions} reactions</span>
        <span>{new Date(voiceNote.created_at || '').toLocaleDateString()}</span>
      </div>
    </div>
  )
}
