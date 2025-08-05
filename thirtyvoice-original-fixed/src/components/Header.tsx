import React, { useState } from 'react'
import { ChevronDown, User, BookmarkIcon, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from './AuthModal'

import { AboutModal } from './AboutModal'
import { FeedbackModal } from './FeedbackModal'

interface HeaderProps {
  // No longer needed since Share Your Voice is removed from header
}

export function Header({}: HeaderProps) {
  const { user, signOut } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [aboutModalOpen, setAboutModalOpen] = useState(false)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)

  const handleSignIn = () => {
    setAuthModalOpen(true)
  }



  const getUserInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
  }

  return (
    <>
      <header className="bg-purple-600 text-white py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">ThirtyVoice</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => setAboutModalOpen(true)}
              className="text-white hover:text-purple-200 transition-colors"
            >
              About
            </button>
            <button 
              onClick={() => setFeedbackModalOpen(true)}
              className="text-white hover:text-purple-200 transition-colors"
            >
              Feedback
            </button>
            
            {!user ? (
              <button
                onClick={handleSignIn}
                className="bg-white text-purple-600 px-4 py-2 rounded-md font-medium hover:bg-purple-50 transition-colors"
              >
                Sign In
              </button>
            ) : (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm font-semibold">
                      {getUserInitials(user.user_metadata?.full_name)}
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-medium text-gray-900">{user.user_metadata?.full_name || 'User'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        My Profile
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2">
                        <BookmarkIcon className="w-4 h-4" />
                        Saved Notes
                      </button>
                      <hr className="my-2" />
                      <button
                        onClick={() => {
                          signOut()
                          setUserMenuOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <button className="md:hidden text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
      

      
      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />
      
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
      />
    </>
  )
}
