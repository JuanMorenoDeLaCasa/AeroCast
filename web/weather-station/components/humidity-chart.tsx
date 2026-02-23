"use client"

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts"
import { format, parseISO } from "date-fns"

interface HumidityDataPoint {
  time: string;
  humedad_exterior_pct: string | number | null;
}

export function HumidityChart({ data = [] }: { data: HumidityDataPoint[] }) {
  // Format data for the chart
  const formattedData: { time: string; humedad_exterior_pct: number | undefined; originalTime: string }[] = data
    .map((item) => ({
      time: format(parseISO(item.time), "dd/MM HH:mm"),
      humedad_exterior_pct: item.humedad_exterior_pct !== undefined && item.humedad_exterior_pct !== null ? Number.parseFloat(item.humedad_exterior_pct as string) : undefined,
      originalTime: item.time,
    }))
    .filter((item) => item.humedad_exterior_pct !== undefined && item.humedad_exterior_pct !== null)

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
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

  const earthGreen = "#4f6f52";

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
            dataKey="humedad_exterior_pct"
            stroke={earthGreen}
            strokeWidth={2.5}
            fillOpacity={0.3}
            fill={earthGreen}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
