import React from 'react'

interface HeroSectionProps {
  totalCount: number
}

export function HeroSection({ totalCount }: HeroSectionProps) {
  return (
    <section className="bg-purple-50 py-12 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          ThirtyVoice
        </h1>
        <p className="text-xl text-gray-600 mb-2">Quality Voice Insights</p>
        
        <div className="my-8">
          <p className="text-2xl font-semibold text-purple-600 mb-4">
            "Forget attention, focus on value"
          </p>
          <p className="text-lg text-gray-700 mb-6">
            Real human thoughts in 30 seconds. No bots, no ads, no BS.
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm inline-block">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Voice Matters</h3>
          <p className="text-gray-600">
            No perfection, no polish required. Just authentic insights
          </p>
        </div>
      </div>
    </section>
  )
}