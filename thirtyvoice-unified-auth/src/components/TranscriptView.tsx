import React from 'react'

interface TranscriptViewProps {
  transcript: string
  isVisible: boolean
}

export function TranscriptView({ transcript, isVisible }: TranscriptViewProps) {
  if (!isVisible || !transcript) return null

  return (
    <div 
      className="mt-4 pt-4 border-t border-gray-200 animate-in slide-in-from-top-2 duration-300"
      aria-live="polite"
    >
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Transcript</h4>
        <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {transcript}
        </div>
      </div>
    </div>
  )
}
