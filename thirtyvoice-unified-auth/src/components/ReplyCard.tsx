import React from 'react'
import { Play, Pause } from 'lucide-react'
import { useAudio } from '@/contexts/AudioContext'
import { Database } from '@/lib/supabase'

type Reply = Database['public']['Tables']['voice_note_replies']['Row'] & {
  user_profile?: {
    full_name: string | null
    role: string | null
  }
}

interface ReplyCardProps {
  reply: Reply
}

export function ReplyCard({ reply }: ReplyCardProps) {
  const { audioState, playTrack, pauseTrack } = useAudio()
  
  const isCurrentTrack = audioState.currentTrackId === `reply-${reply.id}`
  const isPlaying = isCurrentTrack && audioState.isPlaying
  const isLoading = isCurrentTrack && audioState.isLoading

  const getUserInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
  }
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handlePlayPause = async () => {
    if (reply.content_type !== 'voice' || !reply.audio_url) return
    
    if (isPlaying) {
      pauseTrack()
    } else {
      await playTrack(`reply-${reply.id}`, reply.audio_url, reply.audio_url_mp3)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 ml-8">
      {/* User Info */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
          {getUserInitials(reply.user_profile?.full_name)}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 text-sm">
              {reply.user_profile?.full_name || 'Anonymous User'}
            </h4>
            <span className="text-xs text-gray-500">
              {formatDate(reply.created_at)}
            </span>
          </div>
          {reply.user_profile?.role && (
            <p className="text-xs text-gray-600">
              {reply.user_profile.role}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      {reply.content_type === 'text' ? (
        <div className="text-gray-800 leading-relaxed">
          {reply.text_content}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
          <button
            onClick={handlePlayPause}
            disabled={isLoading || !reply.audio_url}
            className="w-8 h-8 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 rounded-full flex items-center justify-center text-white transition-colors"
            aria-label={isPlaying ? 'Pause audio reply' : 'Play audio reply'}
          >
            {isLoading ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-3 h-3" />
            ) : (
              <Play className="w-3 h-3 ml-0.5" />
            )}
          </button>
          
          <div className="flex-1">
            <span className="text-sm text-gray-600">
              Voice Reply{reply.duration ? ` • ${Math.round(reply.duration)}s` : ''}
            </span>
            
            {/* Progress bar for current track */}
            {isCurrentTrack && audioState.duration > 0 && (
              <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-purple-600 h-1 rounded-full transition-all duration-150"
                  style={{ width: `${(audioState.currentTime / audioState.duration) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
