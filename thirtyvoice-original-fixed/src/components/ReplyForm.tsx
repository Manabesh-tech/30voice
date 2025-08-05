import React, { useState } from 'react'
import { MessageSquare, Mic } from 'lucide-react'
import { VoiceRecorder } from './VoiceRecorder'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface ReplyFormProps {
  voiceNoteId: string
  onReplySubmitted: () => void
  onCancel: () => void
}

type ReplyMode = 'text' | 'voice'

export function ReplyForm({ voiceNoteId, onReplySubmitted, onCancel }: ReplyFormProps) {
  const { user } = useAuth()
  const [mode, setMode] = useState<ReplyMode>('text')
  const [textContent, setTextContent] = useState('')
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleTextSubmit = async () => {
    if (!textContent.trim()) {
      setError('Please enter a reply message')
      return
    }

    if (!user) {
      setError('You must be logged in to reply')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const { error: insertError } = await supabase
        .from('voice_note_replies')
        .insert({
          voice_note_id: voiceNoteId,
          user_id: user.id,
          content_type: 'text',
          text_content: textContent.trim()
        })

      if (insertError) throw insertError

      onReplySubmitted()
      setTextContent('')
    } catch (err: any) {
      setError(err.message || 'Failed to submit reply')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVoiceSubmit = async () => {
    if (!voiceBlob) {
      setError('Please record a voice message')
      return
    }

    if (!user) {
      setError('You must be logged in to reply')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Convert voice blob to base64
      const reader = new FileReader()
      reader.readAsDataURL(voiceBlob)
      
      reader.onload = async () => {
        try {
          const audioData = reader.result as string
          const fileName = `reply-${voiceNoteId}-${Date.now()}.webm`

          // Upload via edge function
          const { data, error } = await supabase.functions.invoke('upload-voice-reply', {
            body: {
              voiceNoteId,
              audioData,
              fileName
            }
          })

          if (error) throw error

          onReplySubmitted()
          setVoiceBlob(null)
        } catch (err: any) {
          setError(err.message || 'Failed to submit voice reply')
        } finally {
          setIsSubmitting(false)
        }
      }
      
      reader.onerror = () => {
        setError('Failed to process voice recording')
        setIsSubmitting(false)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit voice reply')
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    if (mode === 'text') {
      await handleTextSubmit()
    } else {
      await handleVoiceSubmit()
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-4">
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Add a Reply</h4>
        
        {/* Mode Toggle */}
        <div className="flex border border-gray-300 rounded-lg overflow-hidden mb-4">
          <button
            onClick={() => setMode('text')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              mode === 'text'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Write Reply
          </button>
          <button
            onClick={() => setMode('voice')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              mode === 'voice'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Mic className="w-4 h-4" />
            Voice Reply
          </button>
        </div>
      </div>

      {/* Content Input */}
      {mode === 'text' ? (
        <div className="mb-4">
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        </div>
      ) : (
        <div className="mb-4">
          <VoiceRecorder
            onRecordingComplete={setVoiceBlob}
            className="py-4"
          />
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || (mode === 'text' && !textContent.trim()) || (mode === 'voice' && !voiceBlob)}
          className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Reply'}
        </button>
      </div>
    </div>
  )
}
