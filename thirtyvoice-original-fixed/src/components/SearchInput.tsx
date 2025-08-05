import React, { useRef } from 'react'
import { Search } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = "Search voice stories..." }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      <input 
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg font-medium text-gray-900 bg-white transition-colors duration-200 outline-none text-base hover:border-gray-300 focus:border-purple-500 focus:shadow-md"
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  )
}
