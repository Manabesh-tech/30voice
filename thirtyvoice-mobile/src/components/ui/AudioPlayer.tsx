import React, { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react'
import { useAudio } from '@/contexts/AudioContext'

interface AudioPlayerProps {
  voiceNoteId: string
  audioUrl: string
  mp3Url?: string | null
  duration: number
  className?: string
}

export function AudioPlayer({ voiceNoteId, audioUrl, mp3Url, duration, className = '' }: AudioPlayerProps) {
  const { audioState, playTrack, pauseTrack, seekTo, clearError } = useAudio()
  const [isDragging, setIsDragging] = useState(false)
  
  const isCurrentTrack = audioState.currentTrackId === voiceNoteId
  const isPlaying = isCurrentTrack && audioState.isPlaying
  const isLoading = isCurrentTrack && audioState.isLoading
  const hasError = isCurrentTrack && audioState.error
  
  const currentTime = isCurrentTrack ? audioState.currentTime : 0
  const trackDuration = isCurrentTrack && audioState.duration ? audioState.duration : duration
  
  const progress = trackDuration > 0 ? (currentTime / trackDuration) * 100 : 0

  const handlePlayPause = async () => {
    if (hasError) {
      clearError()
    }
    
    if (isPlaying) {
      pauseTrack()
    } else {
      await playTrack(voiceNoteId, audioUrl, mp3Url)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCurrentTrack || !trackDuration) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * trackDuration
    
    seekTo(newTime)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (hasError) {
    return (
      <div className={`flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-xl ${className}`}>
        <Volume2 className="w-5 h-5 text-red-400" />
        <div className="flex-1">
          <p className="text-red-400 text-sm">Playback error</p>
          <p className="text-red-300 text-xs">Please try again</p>
        </div>
        <button
          onClick={handlePlayPause}
          className="flex items-center justify-center w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full text-black transition-colors"
          aria-label="Retry"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 ${className}`}>
      {/* Play/Pause Button */}
      <button
        onClick={handlePlayPause}
        disabled={isLoading}
        className="flex items-center justify-center w-12 h-12 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-700 rounded-full text-gray-900 transition-colors shadow-lg"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" />
        )}
      </button>

      {/* Progress Section */}
      <div className="flex-1 min-w-0">
        {/* Progress Bar */}
        <div
          className="relative h-3 bg-gray-700 rounded-full cursor-pointer mb-1 touch-pan-x"
          onClick={handleProgressClick}
        >
          <div
            className="absolute top-0 left-0 h-full bg-teal-500 rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
          {/* Thumb */}
          {isCurrentTrack && (
            <div
              className="absolute top-1/2 w-4 h-4 bg-teal-500 rounded-full shadow-lg transform -translate-y-1/2 transition-all duration-150"
              style={{ left: `calc(${progress}% - 8px)` }}
            />
          )}
        </div>
        
        {/* Time Display */}
        <div className="flex justify-between text-xs text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(trackDuration)}</span>
        </div>
      </div>
    </div>
  )
}
