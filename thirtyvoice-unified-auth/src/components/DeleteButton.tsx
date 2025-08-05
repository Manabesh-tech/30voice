import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { DeleteConfirmationModal } from './DeleteConfirmationModal'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface DeleteButtonProps {
  type: 'voice-note' | 'reply'
  itemId: string
  onDelete: () => void
  className?: string
}

export function DeleteButton({ type, itemId, onDelete, className = '' }: DeleteButtonProps) {
  const { user } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (!user) {
      setError('You must be logged in to delete items')
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      const endpoint = type === 'voice-note' ? 'delete-voice-note' : 'delete-voice-reply'
      const bodyKey = type === 'voice-note' ? 'voiceNoteId' : 'replyId'
      
      const { data, error: deleteError } = await supabase.functions.invoke(endpoint, {
        body: {
          [bodyKey]: itemId
        }
      })

      if (deleteError) {
        console.error('Delete error:', deleteError)
        throw new Error(deleteError.message || 'Failed to delete item')
      }

      console.log('Delete successful:', data)
      
      // Close modal and notify parent component
      setShowModal(false)
      onDelete()
      
    } catch (err: any) {
      console.error('Delete operation failed:', err)
      setError(err.message || 'Failed to delete item. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const getModalContent = () => {
    const isVoiceNote = type === 'voice-note'
    return {
      title: isVoiceNote ? 'Delete Voice Note?' : 'Delete Reply?',
      message: isVoiceNote 
        ? 'Are you sure you want to permanently delete this voice note? This action cannot be undone and will also delete all replies to this message.'
        : 'Are you sure you want to permanently delete this reply? This action cannot be undone and will also delete any nested replies.'
    }
  }

  const { title, message } = getModalContent()

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 ${className}`}
        aria-label={`Delete ${type === 'voice-note' ? 'voice note' : 'reply'}`}
        title={`Delete ${type === 'voice-note' ? 'voice note' : 'reply'}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <DeleteConfirmationModal
        isOpen={showModal}
        onClose={() => {
          if (!isDeleting) {
            setShowModal(false)
            setError('')
          }
        }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title={title}
        message={message}
      />

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </>
  )
}
