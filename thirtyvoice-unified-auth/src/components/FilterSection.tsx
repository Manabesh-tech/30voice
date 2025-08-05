import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { SearchField } from './SearchField'

interface FilterSectionProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

const filters = [
  { id: 'all', label: 'All Vibes' },
  { id: 'funny-light', label: 'Funny & Light' },
  { id: 'deep-insights', label: 'Deep Insights' },
  { id: 'game-changer', label: 'Game Changer' },
  { id: 'creative-spark', label: 'Creative Spark' },
  { id: 'aha-moments', label: 'Aha Moments' },
  { id: 'food-for-thought', label: 'Food for Thought' },
  { id: 'needs-context', label: 'Needs Context' },
  { id: 'explore-more', label: 'Explore More' },
]

export function FilterSection({ activeFilter, onFilterChange, searchQuery, onSearchChange }: FilterSectionProps) {
  const [showFilters, setShowFilters] = useState(false)
  
  return (
    <section className="py-8 px-6 bg-white border-b">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Discover Voice Stories</h2>
        
        {/* Search Field */}
        <div className="mb-6">
          <SearchField
            onSearch={onSearchChange}
            placeholder="Search voice notes, insights, stories..."
            className="max-w-2xl"
          />
        </div>
        
        {/* Filter Section */}
        <div className="mb-4">
          <div className="flex items-center gap-4 mb-3">
            <p className="text-sm text-gray-600">Filter by Vibe:</p>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-1 text-purple-600 hover:text-purple-700 transition-colors"
            >
              <span className="text-sm">Show Filters</span>
              <ChevronDown className={`w-4 h-4 transform transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`} />
            </button>
          </div>
          
          <div className={`flex flex-wrap gap-2 ${
            showFilters ? 'block' : 'hidden md:flex'
          }`}>
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === filter.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Active Filter Display */}
        {(activeFilter !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Showing:</span>
            {searchQuery && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                "{searchQuery}"
              </span>
            )}
            {activeFilter !== 'all' && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                {filters.find(f => f.id === activeFilter)?.label}
              </span>
            )}
            <button
              onClick={() => {
                onFilterChange('all')
                onSearchChange('')
              }}
              className="text-purple-600 hover:text-purple-700 ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
