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

  // Validate if audio URL is accessible
  const validateAudioUrl = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache'
      })
      return response.ok
    } catch (error) {
      console.warn('Audio URL validation failed:', url, error)
      return false
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

      // Pre-validate audio URL accessibility
      const primaryUrlValid = await validateAudioUrl(audioUrl)
      const fallbackUrlValid = mp3Url ? await validateAudioUrl(mp3Url) : false

      if (!primaryUrlValid && !fallbackUrlValid) {
        setAudioState(prev => ({
          ...prev,
          error: 'Audio file is not accessible. Server may be down or URL is invalid.',
          isLoading: false,
          isPlaying: false,
        }))
        return
      }

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
        console.error('Audio playback error:', e, 'Audio src:', audio.src)
        
        // If webm fails and we have mp3, try mp3
        if (mp3Url && audio.src !== mp3Url) {
          console.log('Falling back to MP3 URL:', mp3Url)
          audio.src = mp3Url
          audio.load()
          return
        }
        
        // Determine specific error message based on the type of failure
        let errorMessage = 'Audio playback failed.'
        
        if (audio.error) {
          switch (audio.error.code) {
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = 'Network error: Could not load audio file. Please check your connection.'
              break
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = 'Audio format error: File is corrupted or unsupported.'
              break
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = 'Audio format not supported by this browser.'
              break
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = 'Audio loading was aborted.'
              break
            default:
              // Check for common URL issues
              if (audio.src.includes('http://') && window.location.protocol === 'https:') {
                errorMessage = 'Security error: Cannot load HTTP audio from HTTPS site.'
              } else if (audio.src.includes('.webm')) {
                errorMessage = 'WebM format not supported. Try a different browser.'
              } else {
                errorMessage = 'Audio file unavailable or server error.'
              }
          }
        }
        
        setAudioState(prev => ({
          ...prev,
          error: errorMessage,
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

      // Choose the best available URL based on validation and browser compatibility
      const isWebM = audioUrl.includes('.webm')
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
      
      let selectedUrl = audioUrl
      
      // Prefer validated URLs and browser compatibility
      if (mp3Url && fallbackUrlValid && (isSafari || isWebM || !primaryUrlValid)) {
        console.log('Using MP3 fallback for better compatibility or failed primary URL')
        selectedUrl = mp3Url
      } else if (primaryUrlValid) {
        selectedUrl = audioUrl
      } else {
        // This shouldn't happen due to pre-validation, but fallback just in case
        selectedUrl = mp3Url || audioUrl
      }
      
      audio.src = selectedUrl
      console.log('Selected audio URL:', selectedUrl)

      // CRITICAL: Only load metadata, do NOT auto-play
      audio.preload = 'metadata'
      audio.load()

      // CRITICAL: Only play when explicitly called by user action
      // This must be called directly from a user gesture (click event)
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
