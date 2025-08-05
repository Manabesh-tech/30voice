import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

interface SearchFieldProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

// Custom debounce hook to prevent excessive API calls
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function SearchField({ onSearch, placeholder = "Search conversations...", className = "" }: SearchFieldProps) {
  // Local state for immediate UI updates (no cursor jumping)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Debounced value for actual search operations
  const debouncedSearchQuery = useDebounce(inputValue, 300)

  // Trigger search when debounced value changes
  useEffect(() => {
    onSearch(debouncedSearchQuery)
  }, [debouncedSearchQuery, onSearch])

  // Handle input changes - this updates immediately for smooth typing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    // No direct onSearch call here - let debounce handle it
  }, [])

  // Handle clear button
  const handleClear = useCallback(() => {
    setInputValue('')
    // Focus back to input after clearing
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Handle form submission (when user presses Enter)
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    // Immediately trigger search on Enter without waiting for debounce
    onSearch(inputValue)
  }, [inputValue, onSearch])

  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow all normal keyboard operations without interference
    if (e.key === 'Escape') {
      handleClear()
    }
  }, [handleClear])

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Search icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        
        {/* Input field - completely isolated state management */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-base transition-all duration-200 ease-in-out"
          autoComplete="off"
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="off"
          // Prevent any browser interventions that might cause cursor issues
          data-testid="search-input"
        />
        
        {/* Clear button - only show when there's content */}
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
            aria-label="Clear search"
            tabIndex={0}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>
      
      {/* Search status indicator (optional) */}
      {debouncedSearchQuery && debouncedSearchQuery !== inputValue && (
        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
          <div className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
