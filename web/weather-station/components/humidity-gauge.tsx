"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface HumidityGaugeProps {
  value?: number
  minValue?: number
  maxValue?: number
  className?: string
}

export function HumidityGauge({ value = 50, minValue = 0, maxValue = 100, className }: HumidityGaugeProps) {
  const [displayValue, setDisplayValue] = useState(value)

  // Normalize the value to a percentage for the gauge
  const normalizedValue = Math.min(Math.max(value, minValue), maxValue)
  const percentage = ((normalizedValue - minValue) / (maxValue - minValue)) * 100


  // Color earth tone verde para todo el gauge
  const earthGreen = "#111111";

  // Calculate the SVG arc path
  const radius = 40
  const circumference = radius * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // Animate the humidity value
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
          <path d="M10,50 A40,40 0 0,1 90,50" stroke="#e2e8f0" strokeWidth="7" strokeLinecap="round" fill="none" />

          {/* Colored Gauge */}
          <path
            d="M10,50 A40,40 0 0,1 90,50"
            stroke="url(#grafanaHumGradient)"  // <-- aquí
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${strokeDashoffset}`}
            fill="none"
            className="transition-all duration-300 ease-in-out"
          />

          <defs>
          <linearGradient id="grafanaHumGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffcd" />   {/* Rojo */}
            <stop offset="20%" stopColor="#c7e9b4" />  {/* Naranja fuerte */}
            <stop offset="40%" stopColor="#7fcdbb" />  {/* Amarillo */}
            <stop offset="60%" stopColor="#3fb8c5" />  {/* Amarillo claro / casi blanco */}
            <stop offset="80%" stopColor="#1792c0" />  {/* Celeste */}
            <stop offset="90%" stopColor="#1c5ea9" /> {/* Azul */}
            <stop offset="100%" stopColor="#042886" /> {/* Azul */}
          </linearGradient>
        </defs>


          {/* Tick Marks */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = Math.PI * (i / 5)
            const x1 = 50 - 42 * Math.cos(angle)
            const y1 = 50 - 42 * Math.sin(angle)
            const x2 = 50 - 38 * Math.cos(angle)
            const y2 = 50 - 38 * Math.sin(angle)

            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="0" />
          })}
        </svg>

        {/* Humidity Value */}
        <div className="absolute flex flex-col items-center justify-center translate-y-10">
          <div className="text-4xl font-bold transition-colors" style={{ color: earthGreen }}>{displayValue.toFixed(1)}%</div>
          <div className="text-sm text-gray-500 mt-1">Humedad</div>
        </div>
      </div>
      {/* Min/Max Labels */}
      <div className="flex justify-between w-full px-4 mt-2">
        <div className="text-sm text-gray-500">{minValue}%</div>
        <div className="text-sm text-gray-500">{maxValue}%</div>
      </div>
    </div>
  )
}
