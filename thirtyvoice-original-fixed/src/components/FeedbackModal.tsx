import React, { useState } from 'react'
import { Modal } from './Modal'
import { supabase } from '@/lib/supabase'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FeedbackFormData {
  name: string
  email: string
  feedbackType: string
  message: string
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [formData, setFormData] = useState<FeedbackFormData>({
    name: '',
    email: '',
    feedbackType: 'general',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Submit feedback via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('submit-feedback', {
        body: {
          name: formData.name,
          email: formData.email,
          feedbackType: formData.feedbackType,
          message: formData.message
        }
      })

      console.log('Edge function response:', { data, error })

      // Check for edge function errors
      if (error) {
        console.error('Edge function returned error:', error)
        throw new Error(error.message || 'Failed to submit feedback')
      }

      // Check if the response contains an error (even if HTTP status was 200)
      if (data && data.error) {
        console.error('Backend returned error:', data.error)
        throw new Error(data.error.message || 'Failed to submit feedback')
      }

      // Verify successful response
      if (!data || !data.success) {
        console.error('Unexpected response format:', data)
        throw new Error('Unexpected response from server')
      }

      console.log('Feedback submitted successfully:', data)
      setIsSubmitted(true)
      
      // Reset form after success
      setTimeout(() => {
        setIsSubmitted(false)
        setFormData({ name: '', email: '', feedbackType: 'general', message: '' })
        onClose()
      }, 3000)
    } catch (err: any) {
      console.error('Feedback submission error:', err)
      setError(err.message || 'Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Thank You!">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">✓</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Feedback Submitted Successfully!
          </h3>
          <p className="text-gray-600">
            We appreciate your input and will review it shortly.
          </p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="We'd Love Your Feedback">
      <div className="space-y-6">
        <p className="text-gray-700">
          Your thoughts help us improve ThirtyVoice for everyone.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Your name"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="your.email@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="feedbackType" className="block text-sm font-medium text-gray-700 mb-1">
              Feedback Type
            </label>
            <select
              id="feedbackType"
              name="feedbackType"
              value={formData.feedbackType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              <option value="general">General Feedback</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Tell us what's on your mind..."
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
        
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Or reach us directly at: <a href="mailto:feedback@thirtyvoice.com" className="text-purple-600 hover:text-purple-700">feedback@thirtyvoice.com</a>
          </p>
        </div>
      </div>
    </Modal>
  )
}
