import React, { useState, useRef } from 'react'
import { X, Mic, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { VoiceRecorder } from './VoiceRecorder'

interface ShareVoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ShareVoiceModal({ isOpen, onClose, onSuccess }: ShareVoiceModalProps) {
  const [mode, setMode] = useState<'choose' | 'record' | 'upload'>('choose')
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  if (!isOpen) return null

  const handleRecordingComplete = (blob: Blob) => {
    setRecordedBlob(blob)
    setError('') // Clear any previous errors
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const validTypes = ['audio/mp3', 'audio/wav', 'audio/webm', 'audio/m4a', 'audio/mpeg']
      if (validTypes.includes(file.type) || file.name.toLowerCase().match(/\.(mp3|wav|webm|m4a)$/)) {
        setUploadedFile(file)
        setError('')
      } else {
        setError('Please upload a valid audio file (MP3, WAV, WebM, or M4A)')
      }
    }
  }

  const submitVoiceNote = async () => {
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required')
      return
    }

    const audioFile = recordedBlob || uploadedFile
    if (!audioFile) {
      setError('Please record or upload an audio file')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Convert audio file to base64
      const reader = new FileReader()
      reader.readAsDataURL(audioFile)
      
      reader.onload = async () => {
        const audioData = reader.result as string
        const fileName = uploadedFile?.name || `recording-${Date.now()}.webm`
        const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)

        // Call the upload edge function
        const { data, error } = await supabase.functions.invoke('upload-voice-note', {
          body: {
            audioData,
            fileName,
            title,
            description,
            tags: tagArray
          }
        })

        if (error) {
          throw error
        }

        // Success!
        onSuccess()
        onClose()
        
        // Reset form
        setMode('choose')
        setRecordedBlob(null)
        setUploadedFile(null)
        setTitle('')
        setDescription('')
        setTags('')
      }
      
      reader.onerror = () => {
        setError('Failed to read audio file')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload voice note')
      setLoading(false)
    }
  }

  const resetModal = () => {
    setMode('choose')
    setRecordedBlob(null)
    setUploadedFile(null)
    setTitle('')
    setDescription('')
    setTags('')
    setError('')
    setLoading(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Share Your Voice
        </h2>

        {mode === 'choose' && (
          <div className="space-y-4">
            <p className="text-gray-600 mb-6">
              Share your authentic insights in 30 seconds or less.
            </p>
            
            <button
              onClick={() => setMode('record')}
              className="w-full flex items-center justify-center gap-3 p-4 border-2 border-purple-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <Mic className="w-6 h-6 text-purple-600" />
              <span className="font-medium text-gray-700">Record Audio</span>
            </button>
            
            <button
              onClick={() => setMode('upload')}
              className="w-full flex items-center justify-center gap-3 p-4 border-2 border-purple-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <Upload className="w-6 h-6 text-purple-600" />
              <span className="font-medium text-gray-700">Upload Audio File</span>
            </button>
          </div>
        )}

        {mode === 'record' && (
          <div className="space-y-4">
            <VoiceRecorder
              onRecordingComplete={handleRecordingComplete}
              className="py-4"
            />
          </div>
        )}

        {mode === 'upload' && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {!uploadedFile ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Click to select audio file</p>
                <p className="text-sm text-gray-500 mt-1">MP3, WAV, WebM, or M4A</p>
              </button>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="text-purple-600 hover:text-purple-700 text-sm mt-2 transition-colors"
                >
                  Choose different file
                </button>
              </div>
            )}
          </div>
        )}

        {(recordedBlob || uploadedFile) && (
          <div className="space-y-4 mt-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title / Main Point
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="What's the main insight?"
                // CRITICAL: NO maxLength restriction - allow unlimited text input
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Provide more context about your voice note..."
                // CRITICAL: NO maxLength restriction - allow unlimited text input
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags (optional)
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="technology, business, life (separated by commas)"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setMode('choose')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={submitVoiceNote}
                disabled={loading}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Uploading...' : 'Share Voice Note'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
