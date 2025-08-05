import React from 'react'
import { Filter } from 'lucide-react'

interface FilterBarProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
}

const filters = [
  { id: 'all', label: 'All Vibes', emoji: '🎯' },
  { id: 'funny', label: 'Funny & Light', emoji: '😄' },
  { id: 'deep', label: 'Deep Insights', emoji: '🧠' },
  { id: 'practical', label: 'Practical Tips', emoji: '⚡' },
  { id: 'trending', label: 'Trending', emoji: '🔥' },
]

export function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-lg border-b border-gray-700/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-300">Filter by vibe</span>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
              activeFilter === filter.id
                ? 'bg-teal-500 text-gray-900 shadow-lg'
                : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 border border-gray-600/50'
            }`}
          >
            <span>{filter.emoji}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
