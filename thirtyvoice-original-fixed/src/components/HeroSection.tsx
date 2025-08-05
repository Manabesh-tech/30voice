import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from './AuthModal'
import { ShareVoiceModal } from './ShareVoiceModal'

interface HeroSectionProps {
  totalCount: number
  onVoiceNoteAdded?: () => void
}

export function HeroSection({ totalCount, onVoiceNoteAdded }: HeroSectionProps) {
  const { user } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)

  const handleShareVoice = () => {
    if (!user) {
      setAuthModalOpen(true)
      return
    }
    setShareModalOpen(true)
  }

  return (
    <section className="bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Forget attention, focus on value
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Real human thoughts in 30 seconds. No bots, no ads, no BS.
        </p>
        
        <div className="flex justify-center items-center mb-8">
          <button 
            onClick={handleShareVoice}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Share Your Voice
          </button>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Your Voice Matters</h3>
          <p className="text-gray-600">
            No perfection, no polish required. Just authentic insights
          </p>
        </div>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
      
      <ShareVoiceModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onSuccess={() => {
          onVoiceNoteAdded?.()
        }}
      />
    </section>
  )
}
