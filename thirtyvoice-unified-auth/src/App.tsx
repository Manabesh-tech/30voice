import React, { useState } from 'react'
import { Header } from '@/components/Header'
import { HeroSection } from '@/components/HeroSection'
import { CommunitySection } from '@/components/CommunitySection'
import { FilterSection } from '@/components/FilterSection'
import { VoiceNoteCard } from '@/components/VoiceNoteCard'
import { AudioProvider } from '@/contexts/AudioContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { useVoiceNotes } from '@/hooks/useVoiceNotes'
import './App.css'

function VoiceNotesFeed() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { voiceNotes, loading, error, totalCount, addReaction, refresh } = useVoiceNotes(activeFilter, searchQuery)

  if (loading && voiceNotes.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentic stories...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load stories</p>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <FilterSection 
        activeFilter={activeFilter} 
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <section className="py-8 px-6 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {voiceNotes.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No stories found</h3>
              <p className="text-gray-500">Try adjusting your filter or check back later</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {voiceNotes.map((voiceNote) => (
                <VoiceNoteCard
                  key={voiceNote.id}
                  voiceNote={voiceNote}
                  onReaction={(voteType) => addReaction(voiceNote.id, voteType)}
                  onDelete={() => refresh()}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function App() {
  const { totalCount, refresh } = useVoiceNotes()

  return (
    <AuthProvider>
      <AudioProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <HeroSection totalCount={totalCount} onVoiceNoteAdded={refresh} />
          <CommunitySection totalCount={totalCount} />
          <VoiceNotesFeed />
        
        {/* Footer */}
          <footer className="bg-gray-800 text-white py-8 px-6">
            <div className="max-w-6xl mx-auto text-center">
              <p className="text-gray-300">© 2025 ThirtyVoice - Quality Voice Insights</p>
            </div>
          </footer>
        </div>
      </AudioProvider>
    </AuthProvider>
  )
}

export default App
