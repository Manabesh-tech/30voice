import React, { useState, useRef } from 'react'
import { Mic, Square, Play, Pause } from 'lucide-react'
import CountdownTimer from './CountdownTimer'

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void
  className?: string
}

export function VoiceRecorder({ onRecordingComplete, className = '' }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState('')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // iOS detection function
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  }

  // Get supported audio format for current platform
  const getSupportedAudioFormat = () => {
    if (isIOS()) {
      // iOS Safari prefers MP4/AAC or MP3
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        return 'audio/mp4'
      } else if (MediaRecorder.isTypeSupported('audio/mp3')) {
        return 'audio/mp3'
      } else {
        return 'audio/wav' // Fallback for iOS
      }
    } else {
      // Non-iOS platforms prefer WebM
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        return 'audio/webm;codecs=opus'
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        return 'audio/webm'
      } else {
        return 'audio/mp4' // Fallback
      }
    }
  }

  const startRecording = async () => {
    try {
      setError('')
      
      // Initialize audio context for iOS if needed
      if (isIOS() && !audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // iOS-specific constraints
          sampleRate: isIOS() ? 44100 : undefined,
          channelCount: 1
        } 
      })
      
      const audioFormat = getSupportedAudioFormat()
      console.log('Using audio format:', audioFormat, 'for iOS:', isIOS())
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: audioFormat
      })
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: audioFormat })
        console.log('Created audio blob:', blob.type, 'size:', blob.size)
        setRecordedBlob(blob)
        onRecordingComplete(blob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      setError('Could not access microphone. Please check permissions.')
      console.error('Recording error:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleTimerComplete = () => {
    stopRecording()
  }

  const playRecording = async () => {
    if (recordedBlob && !isPlaying) {
      try {
        // Resume audio context for iOS if needed
        if (isIOS() && audioContextRef.current && audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume()
        }
        
        const url = URL.createObjectURL(recordedBlob)
        audioRef.current = new Audio(url)
        
        // iOS-specific audio setup
        if (isIOS()) {
          audioRef.current.preload = 'auto'
          audioRef.current.controls = false
          // Force load the audio data
          audioRef.current.load()
        }
        
        audioRef.current.onended = () => {
          setIsPlaying(false)
          URL.revokeObjectURL(url)
        }
        
        audioRef.current.onerror = (e) => {
          console.error('Audio playback error:', e)
          setError('Could not play recording. Please try again.')
          setIsPlaying(false)
          URL.revokeObjectURL(url)
        }
        
        audioRef.current.oncanplaythrough = () => {
          console.log('Audio can play through')
        }
        
        // Start playback - this must be triggered by user gesture
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio playback started successfully')
              setIsPlaying(true)
            })
            .catch(error => {
              console.error('Audio play failed:', error)
              setError('Could not play recording. Please try again.')
              setIsPlaying(false)
              URL.revokeObjectURL(url)
            })
        } else {
          setIsPlaying(true)
        }
      } catch (error) {
        console.error('Audio setup error:', error)
        setError('Could not setup audio playback. Please try again.')
      }
    } else if (audioRef.current && isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const resetRecording = () => {
    setRecordedBlob(null)
    setIsPlaying(false)
    setError('')
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }

  if (error) {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md mb-4">
          {error}
        </div>
        <button
          onClick={() => setError('')}
          className="text-purple-600 hover:text-purple-700 text-sm"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className={`text-center space-y-4 ${className}`}>
      {!recordedBlob ? (
        <div>
          {isRecording ? (
            // Recording state with prominent countdown timer
            <div className="text-center">
              <div className="relative mb-4">
                {/* Circular progress background */}
                <div className="w-24 h-24 mx-auto">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="#e5e7eb"
                      strokeWidth="6"
                      fill="none"
                    />
                    {/* Progress circle - will be animated by CountdownTimer */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="#e91e63"
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray="283"
                      strokeDashoffset="0"
                      className="countdown-progress"
                    />
                  </svg>
                  {/* Stop button in center */}
                  <button
                    onClick={stopRecording}
                    className="absolute inset-0 w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors mx-auto my-auto"
                  >
                    <Square className="w-6 h-6 text-white" />
                  </button>
                </div>
                
                {/* Countdown display */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <CountdownTimer onComplete={handleTimerComplete} />
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mt-2 font-medium">
                🔴 Recording... Click stop or wait for timer
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Auto-saves at 30 seconds
              </p>
            </div>
          ) : (
            // Idle state
            <div className="text-center">
              <button
                onClick={startRecording}
                className="w-16 h-16 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-colors mx-auto mb-3 shadow-lg hover:shadow-xl"
              >
                <Mic className="w-6 h-6 text-white" />
              </button>
              <p className="text-sm text-gray-600">
                Click to start recording
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Maximum 30 seconds
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={playRecording}
              className="w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>
            <button
              onClick={resetRecording}
              className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
            >
              Record Again
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Recording complete. Ready to submit.
          </p>
        </div>
      )}
    </div>
  )
}
