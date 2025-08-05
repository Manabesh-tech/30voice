import React, { createContext, useContext, useState, useRef, ReactNode } from 'react'

interface AudioState {
  currentTrackId: string | null
  isPlaying: boolean
  currentTime: number
  duration: number
  isLoading: boolean
  error: string | null
}

interface AudioContextType {
  audioState: AudioState
  playTrack: (trackId: string, audioUrl: string, mp3Url?: string | null) => Promise<void>
  pauseTrack: () => void
  seekTo: (time: number) => void
  clearError: () => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: ReactNode }) {
  const [audioState, setAudioState] = useState<AudioState>({
    currentTrackId: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoading: false,
    error: null,
  })

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const listenersRef = useRef<{
    loadedmetadata?: () => void
    timeupdate?: () => void
    ended?: () => void
    error?: (e: Event) => void
  }>({})

  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      
      // Remove event listeners
      const audio = audioRef.current
      const listeners = listenersRef.current
      
      if (listeners.loadedmetadata) audio.removeEventListener('loadedmetadata', listeners.loadedmetadata)
      if (listeners.timeupdate) audio.removeEventListener('timeupdate', listeners.timeupdate)
      if (listeners.ended) audio.removeEventListener('ended', listeners.ended)
      if (listeners.error) audio.removeEventListener('error', listeners.error)
      
      audioRef.current = null
      listenersRef.current = {}
    }
  }

  const playTrack = async (trackId: string, audioUrl: string, mp3Url?: string | null) => {
    try {
      // If same track is playing, just toggle pause/play
      if (audioState.currentTrackId === trackId && audioRef.current) {
        if (audioState.isPlaying) {
          audioRef.current.pause()
          setAudioState(prev => ({ ...prev, isPlaying: false }))
        } else {
          await audioRef.current.play()
          setAudioState(prev => ({ ...prev, isPlaying: true }))
        }
        return
      }

      // Clean up current audio
      cleanupAudio()

      setAudioState(prev => ({
        ...prev,
        currentTrackId: trackId,
        isLoading: true,
        error: null,
        isPlaying: false,
      }))

      // Create new audio element
      const audio = new Audio()
      audioRef.current = audio

      // Create event handlers
      const handleLoadedMetadata = () => {
        setAudioState(prev => ({
          ...prev,
          duration: audio.duration,
          isLoading: false,
        }))
      }

      const handleTimeUpdate = () => {
        setAudioState(prev => ({
          ...prev,
          currentTime: audio.currentTime,
        }))
      }

      const handleEnded = () => {
        setAudioState(prev => ({
          ...prev,
          isPlaying: false,
          currentTime: 0,
        }))
      }

      const handleError = (e: Event) => {
        console.error('Audio playback error:', e)
        
        // If webm fails and we have mp3, try mp3
        if (mp3Url && audio.src !== mp3Url) {
          audio.src = mp3Url
          audio.load()
          return
        }
        
        setAudioState(prev => ({
          ...prev,
          error: 'Playback failed. Please try again.',
          isLoading: false,
          isPlaying: false,
        }))
      }

      // Store listeners for cleanup
      listenersRef.current = {
        loadedmetadata: handleLoadedMetadata,
        timeupdate: handleTimeUpdate,
        ended: handleEnded,
        error: handleError,
      }

      // Add event listeners
      audio.addEventListener('loadedmetadata', handleLoadedMetadata)
      audio.addEventListener('timeupdate', handleTimeUpdate)
      audio.addEventListener('ended', handleEnded)
      audio.addEventListener('error', handleError)

      // Set audio source with fallback
      // Try MP3 first for better iOS compatibility, then fallback to WebM
      if (mp3Url) {
        audio.src = mp3Url
      } else {
        audio.src = audioUrl
      }

      audio.preload = 'metadata'
      audio.load()

      // Play audio (must be in user gesture for iOS)
      await audio.play()
      setAudioState(prev => ({ ...prev, isPlaying: true, isLoading: false }))

    } catch (error) {
      console.error('Failed to play audio:', error)
      setAudioState(prev => ({
        ...prev,
        error: 'Playback failed. Please try again.',
        isLoading: false,
        isPlaying: false,
      }))
    }
  }

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setAudioState(prev => ({ ...prev, isPlaying: false }))
    }
  }

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setAudioState(prev => ({ ...prev, currentTime: time }))
    }
  }

  const clearError = () => {
    setAudioState(prev => ({ ...prev, error: null }))
  }

  return (
    <AudioContext.Provider
      value={{
        audioState,
        playTrack,
        pauseTrack,
        seekTo,
        clearError,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}
