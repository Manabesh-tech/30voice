import React, { useState, useEffect } from 'react'

interface CountdownTimerProps {
  onComplete: () => void
}

const CountdownTimer = ({ onComplete }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(30)

  useEffect(() => {
    if (timeLeft === 0) {
      onComplete() // Notify parent to stop recording
      return
    }
    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)
    return () => clearInterval(intervalId) // Cleanup
  }, [timeLeft, onComplete])

  const timerColorClass = timeLeft <= 5 ? 'text-red-500 font-bold' : 'text-gray-800'
  const formattedTime = `00:${String(timeLeft).padStart(2, '0')}`

  return (
    <div role="timer" aria-live="polite" className={`text-2xl font-semibold ${timerColorClass}`}>
      {formattedTime}
    </div>
  )
}

export default CountdownTimer
