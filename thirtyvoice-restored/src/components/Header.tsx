import React from 'react'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-purple-600">ThirtyVoice</h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <button className="text-gray-600 hover:text-purple-600 transition-colors">
              About
            </button>
            <button className="text-gray-600 hover:text-purple-600 transition-colors">
              Feedback
            </button>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Share Your Voice
            </button>
            <button className="text-gray-600 hover:text-purple-600 transition-colors">
              Sign In
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}