import React from 'react'
import { Mic, Search, User } from 'lucide-react'

interface HeaderProps {
  onSearchClick?: () => void
  onProfileClick?: () => void
}

export function Header({ onSearchClick, onProfileClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-lg border-b border-gray-700/50">
      <div className="flex items-center justify-between p-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
            ThirtyVoice
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSearchClick}
            className="w-10 h-10 bg-gray-800/60 hover:bg-gray-700/60 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          
          <button
            onClick={onProfileClick}
            className="w-10 h-10 bg-gray-800/60 hover:bg-gray-700/60 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-colors"
            aria-label="Profile"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
