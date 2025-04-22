"use client"

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts"
import { format, parseISO } from "date-fns"

export function HumidityChart({ data = [] }) {
  // Format data for the chart
  const formattedData = data.map((item) => ({
    time: format(parseISO(item.time), "dd/MM HH:mm"),
    humidity: Number.parseFloat(item.humidity),
    originalTime: item.time,
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <p className="text-xs font-medium">{label}</p>
          <p className="text-sm font-semibold text-primary">{`${payload[0].value.toFixed(1)}%`}</p>
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
            domain={[0, 100]}
            label={{
              value: "%",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle", fill: "#64748b" },
            }}
            stroke="#94a3b8"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            name="Humedad"
            type="monotone"
            dataKey="humidity"
            stroke="#3a86ff"  // Línea de la gráfica en color #656d4a
            strokeWidth={2.5}
            fillOpacity={0.3}  // Opacidad reducida para el área debajo de la línea
            fill="#3a86ff"  // Área debajo de la línea con el mismo color, pero con opacidad
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
