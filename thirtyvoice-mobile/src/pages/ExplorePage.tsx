import React from 'react'
import { Search, TrendingUp, Users, Clock } from 'lucide-react'
import { InputField } from '@/components/ui/InputField'

export function ExplorePage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 pb-24">
      {/* Search with CRITICAL TEXT FIELD FIX */}
      <div className="mb-6">
        <InputField
          type="text"
          placeholder="Search voice notes..."
          variant="search"
          icon={<Search className="w-5 h-5" />}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            <span className="text-sm font-medium text-gray-300">Trending</span>
          </div>
          <p className="text-2xl font-bold text-gray-100">247</p>
          <p className="text-xs text-gray-500">This week</p>
        </div>
        
        <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Active Users</span>
          </div>
          <p className="text-2xl font-bold text-gray-100">1.2k</p>
          <p className="text-xs text-gray-500">Online now</p>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Explore Categories</h2>
        
        {[
          { title: 'Business Insights', count: 156, color: 'from-blue-500 to-purple-500', emoji: '💼' },
          { title: 'Tech Talk', count: 98, color: 'from-green-500 to-teal-500', emoji: '💻' },
          { title: 'Life Hacks', count: 203, color: 'from-yellow-500 to-orange-500', emoji: '✨' },
          { title: 'Funny Stories', count: 84, color: 'from-pink-500 to-red-500', emoji: '😄' },
          { title: 'Deep Thoughts', count: 67, color: 'from-purple-500 to-indigo-500', emoji: '🧠' },
        ].map((category, index) => (
          <div
            key={index}
            className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:bg-gray-700/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-xl`}>
                  {category.emoji}
                </div>
                <div>
                  <h3 className="font-medium text-gray-100">{category.title}</h3>
                  <p className="text-sm text-gray-400">{category.count} voice notes</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Recent</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
