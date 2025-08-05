import React from 'react'
import { Play, Pause } from 'lucide-react'
import { useAudio } from '@/contexts/AudioContext'
import { supabase } from '@/lib/supabase'

interface AudioPlayerProps {
  voiceNoteId: string
  audioUrl: string
  mp3Url?: string | null
  duration: number
  listenCount: number
  onListenCountUpdate?: (newCount: number) => void
}

export function AudioPlayer({ voiceNoteId, audioUrl, mp3Url, duration, listenCount, onListenCountUpdate }: AudioPlayerProps) {
  const { audioState, playTrack, pauseTrack, clearError } = useAudio()
  
  const isCurrentTrack = audioState.currentTrackId === voiceNoteId
  const isPlaying = isCurrentTrack && audioState.isPlaying
  const isLoading = isCurrentTrack && audioState.isLoading
  const hasError = isCurrentTrack && audioState.error
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayPause = async () => {
    if (hasError) {
      clearError()
    }
    
    if (isPlaying) {
      pauseTrack()
    } else {
      const incrementListenCount = async () => {
        try {
          // 1. OPTIMISTIC UI UPDATE - increment counter immediately
          if (onListenCountUpdate) {
            onListenCountUpdate(listenCount + 1)
          }

          // 2. BACKEND CALL to increment-listen-count edge function
          const { data, error } = await supabase.functions.invoke('increment-listen-count', {
            body: { voice_note_id: voiceNoteId }
          })

          if (error) {
            console.error('Listen count increment error:', error)
            // Revert optimistic update on error
            if (onListenCountUpdate) {
              onListenCountUpdate(listenCount)
            }
          } else {
            console.log('✅ Listen count incremented successfully:', data)
          }
        } catch (error) {
          console.error('Failed to increment listen count:', error)
          // Revert optimistic update on error
          if (onListenCountUpdate) {
            onListenCountUpdate(listenCount)
          }
        }
      }
      
      await playTrack(voiceNoteId, audioUrl, mp3Url, incrementListenCount)
    }
  }

  if (hasError) {
    return (
      <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
        <button
          onClick={handlePlayPause}
          className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
          aria-label="Retry audio"
        >
          <Play className="w-4 h-4 ml-0.5" />
        </button>
        <div className="flex-1">
          <p className="text-red-600 text-sm font-medium">Audio error</p>
          <p className="text-red-500 text-xs">
            {audioState.error || 'Tap to retry'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
      <button
        onClick={handlePlayPause}
        disabled={isLoading}
        className="w-10 h-10 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 rounded-full flex items-center justify-center text-white transition-colors shadow-sm"
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>
      
      <div className="flex-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">{formatDuration(duration)}</span>
          <span className="text-gray-500">{listenCount} listens</span>
        </div>
        
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
  )
}
