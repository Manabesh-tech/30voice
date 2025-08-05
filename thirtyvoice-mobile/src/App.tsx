import React, { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { HomePage } from '@/pages/HomePage'
import { ExplorePage } from '@/pages/ExplorePage'
import { AudioProvider } from '@/contexts/AudioContext'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('home')

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />
      case 'explore':
        return <ExplorePage />
      case 'saved':
        return (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Saved Voice Notes</h2>
              <p>Your saved content will appear here</p>
            </div>
          </div>
        )
      case 'profile':
        return (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Profile</h2>
              <p>Your profile and settings</p>
            </div>
          </div>
        )
      default:
        return <HomePage />
    }
  }

  return (
    <AudioProvider>
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
        <Header />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {renderContent()}
        </main>
        
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </AudioProvider>
  )
}

export default App
