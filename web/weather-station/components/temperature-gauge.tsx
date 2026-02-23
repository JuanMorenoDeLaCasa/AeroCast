"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TemperatureGaugeProps {
  value?: number
  minValue?: number
  maxValue?: number
  className?: string
}

export function TemperatureGauge({
  value = 22.5,
  minValue = -5,
  maxValue = 40,
  className,
}: TemperatureGaugeProps) {
  const [displayValue, setDisplayValue] = useState(value)

  const normalizedValue = Math.min(Math.max(value, minValue), maxValue)
  const percentage = ((normalizedValue - minValue) / (maxValue - minValue)) * 100

  const radius = 40
  const circumference = radius * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

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
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full",
        className
      )}
    >
      <div className="relative flex items-center justify-center w-full aspect-[2/1.2]">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Fondo */}
          <path
            d="M10,50 A40,40 0 0,1 90,50"
            stroke="#e2e8f0"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />

          {/* Gauge con gradiente */}
          <path
            d="M10,50 A40,40 0 0,1 90,50"
            stroke="url(#tempGradient)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${strokeDashoffset}`}
            fill="none"
            className="transition-all duration-300 ease-in-out"
          />

          <defs>
            <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4376b6" />
              <stop offset="16%" stopColor="#92c0dc" />
              <stop offset="33%" stopColor="#e0f2f7" />
              <stop offset="50%" stopColor="#ffffc0" />
              <stop offset="66%" stopColor="#ffe392" />
              <stop offset="83%" stopColor="#fc8d57" />
              <stop offset="100%" stopColor="#d72b22" />
            </linearGradient>
          </defs>

          {/* Marcas */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = Math.PI * (i / 5)
            const x1 = 50 - 42 * Math.cos(angle)
            const y1 = 50 - 42 * Math.sin(angle)
            const x2 = 50 - 38 * Math.cos(angle)
            const y2 = 50 - 38 * Math.sin(angle)

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#94a3b8"
                strokeWidth="0"
              />
            )
          })}
        </svg>

        {/* Valor */}
        <div className="absolute flex flex-col items-center justify-center translate-y-10">
          <div
            className="text-4xl font-bold transition-colors"
            style={{ color: "#111111" }}
          >
            {displayValue.toFixed(1)}°C
          </div>
          <div className="text-sm text-gray-500 mt-1">Temperatura</div>
        </div>
      </div>

      {/* Min / Max */}
      <div className="flex justify-between w-full px-4 mt-2">
        <div className="text-sm text-gray-500">{minValue}°C</div>
        <div className="text-sm text-gray-500">{maxValue}°C</div>
      </div>
    </div>
  )
}
