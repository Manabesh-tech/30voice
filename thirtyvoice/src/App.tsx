import React, { useState, useEffect, useCallback } from 'react';
import './index.css';

interface VoiceStory {
  id: number;
  author: string;
  profession: string;
  topic: string;
  date: string;
  duration: string;
  listeners: number;
  transcript: string;
  hashtags: string[];
  reactions: {
    funny: number;
    insightful: number;
    gameChanger: number;
    creative: number;
    aha: number;
    debatable: number;
  };
  communityScore: number;
  replies: number;
  vibe: string;
}

const reactionEmojis = {
  funny: '😄',
  insightful: '💡',
  gameChanger: '🚀',
  creative: '🎨',
  aha: '💫',
  debatable: '🤔'
};

const vibeFilters = [
  'All',
  'Funny & Light',
  'Deep Insights', 
  'Game Changer',
  'Creative',
  'Debatable'
];

function App() {
  const [stories, setStories] = useState<VoiceStory[]>([]);
  const [filteredStories, setFilteredStories] = useState<VoiceStory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Load stories on mount
  useEffect(() => {
    const loadStories = async () => {
      try {
        const response = await fetch('/data/voice-stories.json');
        const data = await response.json();
        setStories(data);
        setFilteredStories(data);
      } catch (error) {
        console.error('Error loading stories:', error);
      }
    };
    loadStories();
  }, []);

  // Filter stories based on search and vibe filter
  useEffect(() => {
    let filtered = stories;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(story => 
        story.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.transcript.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.hashtags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply vibe filter
    if (activeFilter !== 'All') {
      filtered = filtered.filter(story => story.vibe === activeFilter);
    }

    setFilteredStories(filtered);
  }, [searchTerm, activeFilter, stories]);

  // CRITICAL: Fixed search input handler to prevent cursor jumping
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Get the current cursor position BEFORE the state updates
    const cursorPosition = e.target.selectionStart;
    
    // Update the state as usual
    setSearchTerm(e.target.value);
    
    // Defer setting the cursor position until after the re-render
    setTimeout(() => {
      // Check if the target element still exists to prevent errors
      if (e.target) {
        e.target.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <a href="#" className="logo">ThirtyVoice</a>
          <nav className="nav-links">
            <a href="#" className="nav-link">About</a>
            <a href="#" className="nav-link">Feedback</a>
            <button 
              onClick={() => setIsSignedIn(!isSignedIn)}
              className="sign-in-btn"
            >
              {isSignedIn ? 'Sign Out' : 'Sign In'}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <h1>Forget attention, focus on value</h1>
        <p>Real human thoughts in 30 seconds. No bots, no ads, no BS.</p>
        <a href="#" className="share-voice-btn">Share Your Voice</a>
      </section>

      {/* Voice Matters Section */}
      <section className="voice-matters">
        <h2>Your Voice Matters</h2>
        <p>No perfection, no polish required. Just authentic insights.</p>
      </section>

      {/* Community Voices */}
      <section className="community">
        <h2>Community Voices</h2>
        <p className="subtitle">{stories.length} authentic stories shared</p>
      </section>

      {/* Discover Voice Stories */}
      <section className="discover">
        <h2>Discover Voice Stories</h2>
        
        {/* Search Input - CRITICAL FIX APPLIED */}
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search stories, topics, or authors... (try typing 'sachin')"
          className="search-input"
        />
        
        {/* Vibe Filters */}
        <div className="filters">
          {vibeFilters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Voice Stories Grid */}
        <div className="voice-grid">
          {filteredStories.map(story => (
            <div key={story.id} className="voice-card">
              {/* Voice Header */}
              <div className="voice-header">
                <div className="avatar">
                  {getInitials(story.author)}
                </div>
                <div className="voice-info">
                  <h3>{story.author}</h3>
                  <p>{story.profession}</p>
                </div>
              </div>

              {/* Voice Meta */}
              <div className="voice-meta">
                <span>{story.date}</span>
                <span>{story.duration}</span>
                <span>{formatNumber(story.listeners)} listeners</span>
              </div>

              {/* Voice Topic */}
              <div className="voice-topic">{story.topic}</div>

              {/* Voice Transcript */}
              <div className="voice-transcript">{story.transcript}</div>

              {/* Hashtags */}
              <div className="voice-hashtags">
                {story.hashtags.map((tag, index) => (
                  <span key={index} className="hashtag">{tag}</span>
                ))}
              </div>

              {/* Reactions */}
              <div className="voice-reactions">
                <div className="reaction-group">
                  {Object.entries(story.reactions).map(([type, count]) => (
                    <div key={type} className="reaction">
                      <span>{reactionEmojis[type as keyof typeof reactionEmojis]}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Voice Stats */}
              <div className="voice-stats">
                <div className="community-score">
                  <span>⭐</span>
                  <span>{story.communityScore}</span>
                </div>
                <span>{story.replies} replies</span>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredStories.length === 0 && (searchTerm || activeFilter !== 'All') && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#6b7280'
          }}>
            <p>No stories found matching your search criteria.</p>
            <p>Try adjusting your search terms or filters.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;