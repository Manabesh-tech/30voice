import React from 'react'
import { Search } from 'lucide-react'

interface FilterSectionProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

const vibeFilters = [
  'All Vibes',
  'Funny & Light', 
  'Deep Insights',
  'Game Changer',
  'Creative Spark',
  'Aha Moments',
  'Food for Thought',
  'Needs Context',
  'Explore More'
]

export function FilterSection({ activeFilter, onFilterChange, searchQuery, onSearchChange }: FilterSectionProps) {
  return (
    <section className="py-6 px-6 bg-gray-50 border-b border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Discover Voice Stories</h3>
          
          <div className="flex items-center space-x-4 mb-4">
            <Search className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700 font-medium">Filter by Vibe:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {vibeFilters.map((vibe) => (
              <button
                key={vibe}
                onClick={() => onFilterChange(vibe.toLowerCase().replace(/\s+/g, '_').replace('&', 'and'))}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === vibe.toLowerCase().replace(/\s+/g, '_').replace('&', 'and')
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
                }`}
              >
                {vibe}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}