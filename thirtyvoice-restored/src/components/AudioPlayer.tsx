import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'

interface AudioPlayerProps {
  audioUrl: string
  listenCount: number
  onListenIncrement?: () => void
}

export function AudioPlayer({ audioUrl, listenCount, onListenIncrement }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlayPause = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        // Increment listen count on first play
        if (!hasStartedPlaying && onListenIncrement) {
          onListenIncrement()
          setHasStartedPlaying(true)
        }
        
        await audio.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('Audio playback error:', error)
      setIsPlaying(false)
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="bg-gray-50 rounded-lg p-4 my-4">
      <audio 
        ref={audioRef} 
        src={audioUrl}
        preload="metadata"
        // Add crossOrigin for better compatibility
        crossOrigin="anonymous"
      />
      
      <div className="flex items-center space-x-4">
        <button
          onClick={togglePlayPause}
          className="flex items-center justify-center w-10 h-10 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>
        
        <div className="flex-1">
          <div className="bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-200"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{formatTime(currentTime)}</span>
            <span className="flex items-center space-x-2">
              <span>⚡ Listen</span>
              <span>{formatTime(duration)}</span>
            </span>
            <span>{listenCount} listens</span>
          </div>
        </div>
      </div>
    </div>
  )
}