"use client"

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts"
import { format, parseISO } from "date-fns"

export function TemperatureChart({ data = [] }) {
  // Filtrar los datos para eliminar los puntos sin medición (undefined o null)
  const formattedData = data
    .map((item) => ({
      time: format(parseISO(item.time), "dd/MM HH:mm"),
      temperature: item.temperature !== undefined && item.temperature !== null ? Number.parseFloat(item.temperature) : undefined,
      originalTime: item.time,
    }))
    .filter((item) => item.temperature !== undefined && item.temperature !== null)  // Eliminar los puntos sin medición

  // Si hay mediciones, obtener los valores mínimo y máximo
  const temperatures = formattedData.map((item) => item.temperature)
  const minTemp = Math.floor(Math.min(...temperatures, 0))
  const maxTemp = Math.ceil(Math.max(...temperatures, 40))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <p className="text-xs font-medium">{label}</p>
          <p className="text-sm font-semibold text-primary">{`${payload[0].value.toFixed(1)}°C`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <YAxis
            domain={[minTemp, maxTemp]}
            label={{
              value: "°C",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle", fill: "#64748b" },
            }}
            stroke="#94a3b8"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            name="Temperatura"
            type="monotone"
            dataKey="temperature"
            stroke="#3a86ff"
            strokeWidth={2.5}
            fillOpacity={0.3}
            fill="#3a86ff"
            activeDot={{ r: 5 }}
            connectNulls={false}  // Esto asegura que no se conecten los puntos con valores null o undefined
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
