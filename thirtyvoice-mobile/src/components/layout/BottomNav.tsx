import React from 'react'
import { Home, Compass, Bookmark, User } from 'lucide-react'

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'explore', icon: Compass, label: 'Explore' },
  { id: 'saved', icon: Bookmark, label: 'Saved' },
  { id: 'profile', icon: User, label: 'Profile' },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700/50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-lg transition-all ${
                isActive
                  ? 'text-teal-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-2' : 'stroke-1.5'}`} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 bg-teal-400 rounded-full mt-0.5" />
              )}
            </button>
          )
        })}
      </div>
      
      {/* Safe area padding for devices with home indicator */}
      <div className="h-4 bg-gray-900/95" />
    </nav>
  )
}
