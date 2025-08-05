import React from 'react'
import { cn } from '@/lib/utils'

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'search'
  icon?: React.ReactNode
}

export function InputField({ 
  className, 
  variant = 'default', 
  icon,
  ...props 
}: InputFieldProps) {
  const searchStyles = icon ? 'pl-10' : ''
  
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        className={cn(
          'text-input-field', // Critical CSS fix class from index.css
          variant === 'search' && searchStyles,
          className
        )}
        {...props}
      />
    </div>
  )
}

export default InputField