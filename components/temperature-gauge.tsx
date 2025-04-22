"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TemperatureGaugeProps {
  value?: number
  minValue?: number
  maxValue?: number
  className?: string
}

export function TemperatureGauge({ value = 22.5, minValue = -5, maxValue = 45, className }: TemperatureGaugeProps) {
  const [displayValue, setDisplayValue] = useState(value)

  // Normalize the value to a percentage for the gauge
  const normalizedValue = Math.min(Math.max(value, minValue), maxValue)
  const percentage = ((normalizedValue - minValue) / (maxValue - minValue)) * 100

  // Calculate the SVG arc path
  const radius = 40
  const circumference = radius * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // Animate the temperature value
  useEffect(() => {
    const start = displayValue
    const end = value
    const duration = 1000
    const startTime = performance.now()

    const animateValue = (timestamp: number) => {
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const currentValue = start + (end - start) * progress

      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animateValue)
      }
    }

    requestAnimationFrame(animateValue)
  }, [value])

  return (
    <div className={cn("relative flex flex-col items-center justify-center w-full", className)}>
      <div className="relative flex items-center justify-center w-full aspect-[2/1.2]">
        {/* SVG Gauge */}
        <svg className="w-full h-full" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Track */}
          <path d="M10,50 A40,40 0 0,1 90,50" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" fill="none" />

          {/* Colored Gauge */}
          <path
            d="M10,50 A40,40 0 0,1 90,50"
            stroke="url(#gaugeGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${strokeDashoffset}`}
            fill="none"
            className="transition-all duration-300 ease-in-out"
          />

          {/* Gradient Definition */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e40af" /> {/* blue-800 */}
              <stop offset="100%" stopColor="#3b82f6" /> {/* blue-500 */}
            </linearGradient>
          </defs>

          {/* Tick Marks */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = Math.PI * (i / 5)
            const x1 = 50 - 42 * Math.cos(angle)
            const y1 = 50 - 42 * Math.sin(angle)
            const x2 = 50 - 38 * Math.cos(angle)
            const y2 = 50 - 38 * Math.sin(angle)

            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="1" />
          })}
        </svg>

        {/* Temperature Value */}
        <div className="absolute flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-blue-600 transition-colors">{displayValue.toFixed(1)}°C</div>
          <div className="text-sm text-gray-500 mt-1">Temperatura</div>
        </div>
      </div>

      {/* Min/Max Labels */}
      <div className="flex justify-between w-full px-4 mt-2">
        <div className="text-sm text-gray-500">{minValue}°C</div>
        <div className="text-sm text-gray-500">{maxValue}°C</div>
      </div>

      {/* Temperature Scale with Blue Gradient */}
      <div className="w-full h-3 rounded-full mt-2 overflow-hidden relative">
        {/* Full gradient background (always visible) */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background: "linear-gradient(to right, #1e40af, #2563eb, #3b82f6, #60a5fa, #93c5fd)",
          }}
        />

        {/* Overlay that covers the unused portion of the gradient */}
        <div
          className="absolute top-0 right-0 h-full bg-gray-100 transition-all duration-300 ease-in-out"
          style={{ width: `${100 - percentage}%` }}
        />
      </div>
    </div>
  )
}
