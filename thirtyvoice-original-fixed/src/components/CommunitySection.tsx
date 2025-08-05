import React from 'react'

interface CommunitySectionProps {
  totalCount: number
}

export function CommunitySection({ totalCount }: CommunitySectionProps) {
  return (
    <section className="py-8 px-6 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Community Voices</h2>
        <p className="text-xl text-gray-600">
          <span className="font-semibold text-purple-600">{totalCount}</span> authentic stories shared
        </p>
      </div>
    </section>
  )
}
