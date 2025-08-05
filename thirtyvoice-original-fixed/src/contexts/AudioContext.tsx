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
  playTrack: (trackId: string, audioUrl: string, mp3Url?: string | null, onListenCountIncrement?: () => void) => Promise<void>
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
    play?: () => void
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
      if (listeners.play) audio.removeEventListener('play', listeners.play)
      if (listeners.ended) audio.removeEventListener('ended', listeners.ended)
      if (listeners.error) audio.removeEventListener('error', listeners.error)
      
      audioRef.current = null
      listenersRef.current = {}
    }
  }

  const playTrack = async (trackId: string, audioUrl: string, mp3Url?: string | null, onListenCountIncrement?: () => void) => {
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

      // CRITICAL: Clean up current audio to prevent auto-play bugs
      cleanupAudio()

      setAudioState(prev => ({
        ...prev,
        currentTrackId: trackId,
        isLoading: true,
        error: null,
        isPlaying: false,
      }))

      // Create new audio element with explicit NO AUTO-PLAY
      const audio = new Audio()
      audio.autoplay = false // CRITICAL: Explicitly disable autoplay
      audio.controls = false // We provide our own controls
      audioRef.current = audio

      // Track if this audio has been counted to prevent duplicate listen counts
      let hasBeenCounted = false

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

      const handlePlay = () => {
        // Increment listen count only once per playback session
        if (!hasBeenCounted && onListenCountIncrement) {
          hasBeenCounted = true
          onListenCountIncrement()
        }
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
          console.log('WebM failed, trying MP3 fallback')
          audio.src = mp3Url
          audio.load()
          return
        }
        
        // If WebM fails and no MP3, try to convert URL to a more compatible format
        if (audioUrl.includes('.webm') && !mp3Url) {
          console.log('WebM not supported, audio playback failed')
        }
        
        setAudioState(prev => ({
          ...prev,
          error: 'Audio format not supported in this browser.',
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
        play: handlePlay,
      }

      // Add event listeners
      audio.addEventListener('loadedmetadata', handleLoadedMetadata)
      audio.addEventListener('timeupdate', handleTimeUpdate)
      audio.addEventListener('play', handlePlay)
      audio.addEventListener('ended', handleEnded)
      audio.addEventListener('error', handleError)

      // Check browser WebM support and prioritize compatible formats
      const canPlayWebM = audio.canPlayType('audio/webm') !== ''
      const canPlayMP3 = audio.canPlayType('audio/mpeg') !== ''
      
      console.log('Browser support - WebM:', canPlayWebM, 'MP3:', canPlayMP3)
      
      // Set audio source with browser compatibility priority
      if (mp3Url && canPlayMP3) {
        console.log('Using MP3 format')
        audio.src = mp3Url
      } else if (canPlayWebM && audioUrl) {
        console.log('Using WebM format')
        audio.src = audioUrl
      } else if (mp3Url) {
        console.log('Fallback to MP3')
        audio.src = mp3Url
      } else {
        console.log('Using original URL as fallback')
        audio.src = audioUrl
      }

      // Set preload to metadata to prepare audio
      audio.preload = 'metadata'
      audio.load()

      // Wait for audio to be ready before playing
      const playAudio = () => {
        audio.play()
          .then(() => {
            setAudioState(prev => ({ ...prev, isPlaying: true, isLoading: false }))
          })
          .catch((error) => {
            console.error('Play failed:', error)
            setAudioState(prev => ({
              ...prev,
              error: 'Playback failed. Please try again.',
              isLoading: false,
              isPlaying: false,
            }))
          })
      }

      // If audio is already loaded, play immediately
      if (audio.readyState >= 3) {
        playAudio()
      } else {
        // Wait for audio to load enough data to play
        const handleCanPlay = () => {
          audio.removeEventListener('canplay', handleCanPlay)
          playAudio()
        }
        audio.addEventListener('canplay', handleCanPlay)
      }

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
