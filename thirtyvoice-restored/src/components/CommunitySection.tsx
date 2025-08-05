import React from 'react'

interface CommunitySectionProps {
  totalCount: number
}

export function CommunitySection({ totalCount }: CommunitySectionProps) {
  return (
    <section className="py-8 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Community Voices</h2>
          <p className="text-lg text-purple-600 font-semibold">
            {totalCount} authentic stories shared
          </p>
        </div>
      </div>
    </section>
  )
}