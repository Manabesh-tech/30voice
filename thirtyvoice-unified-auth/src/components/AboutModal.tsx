import React from 'react'
import { Modal } from './Modal'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ThirtyVoice - Quality Voice Insights">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h3>
          <blockquote className="text-lg text-purple-600 font-medium italic mb-4 border-l-4 border-purple-600 pl-4">
            "Forget attention, focus on value"
          </blockquote>
          <p className="text-gray-700 leading-relaxed">
            We believe in authentic human thoughts shared in 30 seconds. No bots, no ads, no BS.
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            Your voice matters. No perfection, no polish required. Just authentic insights that create real value for our community.
          </p>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Features</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">•</span>
              Share authentic voice insights in 30 seconds
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">•</span>
              Discover valuable perspectives from real people
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">•</span>
              React and engage with meaningful content
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">•</span>
              Build a community focused on substance over attention
            </li>
          </ul>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Join our community of authentic voices sharing real insights.
          </p>
        </div>
      </div>
    </Modal>
  )
}
