import React, { useState } from 'react'
import { RefreshCw, Loader2 } from 'lucide-react'
import { FilterBar } from '@/components/ui/FilterBar'
import { VoiceNoteCard } from '@/components/ui/VoiceNoteCard'
import { useVoiceNotes } from '@/hooks/useVoiceNotes'

export function HomePage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const { voiceNotes, loading, error, addReaction, toggleSave, refresh } = useVoiceNotes(activeFilter)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
  }

  if (loading && voiceNotes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>Loading voice notes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load voice notes</p>
          <button
            onClick={handleRefresh}
            className="bg-teal-500 hover:bg-teal-600 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-hidden">
      <FilterBar activeFilter={activeFilter} onFilterChange={handleFilterChange} />
      
      <div className="flex-1 overflow-y-auto">
        {/* Pull to refresh indicator */}
        <div className="p-4 text-center">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 mx-auto text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Pull to refresh</span>
          </button>
        </div>

        {/* Voice Notes Feed */}
        <div className="space-y-4 p-4 pb-24">
          {voiceNotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800/60 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">No voice notes found</h3>
              <p className="text-gray-500 text-sm mb-4">Try changing your filter or check back later</p>
              <button
                onClick={handleRefresh}
                className="bg-teal-500 hover:bg-teal-600 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Refresh
              </button>
            </div>
          ) : (
            voiceNotes.map((voiceNote) => (
              <VoiceNoteCard
                key={voiceNote.id}
                voiceNote={voiceNote}
                onReaction={(voteType) => addReaction(voiceNote.id, voteType)}
                onSave={() => toggleSave(voiceNote.id)}
                onViewTranscript={() => {
                  // TODO: Implement transcript modal
                  console.log('View transcript:', voiceNote.transcript)
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
