import React, { useState, useEffect } from 'react'

interface CountdownTimerProps {
  onComplete: () => void
}

const CountdownTimer = ({ onComplete }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(30)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    if (timeLeft === 0) {
      onComplete() // Notify parent to stop recording
      return
    }
    
    const intervalId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const remaining = Math.max(0, 30 - elapsed)
      setTimeLeft(remaining)
      
      if (remaining === 0) {
        onComplete()
      }
    }, 100) // Update more frequently for smoother progress
    
    return () => clearInterval(intervalId)
  }, [startTime, onComplete])

  // Update progress circle
  useEffect(() => {
    const progressCircle = document.querySelector('.countdown-progress') as SVGCircleElement
    if (progressCircle) {
      const circumference = 2 * Math.PI * 45 // radius = 45
      const progress = (30 - timeLeft) / 30
      const offset = circumference * progress
      progressCircle.style.strokeDashoffset = offset.toString()
    }
  }, [timeLeft])

  const timerColorClass = timeLeft <= 5 ? 'text-red-500 font-bold animate-pulse' : 'text-white'
  const bgColorClass = timeLeft <= 5 ? 'bg-red-500' : 'bg-gray-900'
  
  return (
    <div 
      role="timer" 
      aria-live="polite" 
      className={`text-lg font-bold ${timerColorClass} ${bgColorClass} rounded-full w-12 h-12 flex items-center justify-center border-2 border-white shadow-lg`}
    >
      {timeLeft}
    </div>
  )
}

export default CountdownTimer
