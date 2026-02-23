import { useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { format, parseISO } from "date-fns"

interface ChartDashboardProps {
  data: Array<{
    time: string
    temperatura_exterior_C?: string | number | null
    humedad_exterior_pct?: string | number | null
  }>
}

export function ChartDashboard({ data }: ChartDashboardProps) {
  const [selected, setSelected] = useState<"temp" | "hum">("temp")

  // Formatear datos
  const formattedData = data.map((item) => ({
    time: format(parseISO(item.time), "dd/MM HH:mm"),
    temperatura_exterior_C:
      item.temperatura_exterior_C !== undefined && item.temperatura_exterior_C !== null
        ? Number.parseFloat(item.temperatura_exterior_C as string)
        : undefined,
    humedad_exterior_pct:
      item.humedad_exterior_pct !== undefined && item.humedad_exterior_pct !== null
        ? Number.parseFloat(item.humedad_exterior_pct as string)
        : undefined,
  }))

  // Calcular límites Y dinámicos
  let yMin = 0
  let yMax = 100

  if (selected === "temp") {
    const temps = formattedData
      .map((d) => d.temperatura_exterior_C)
      .filter((t): t is number => t !== undefined)
    if (temps.length) {
      const minTemp = Math.min(...temps)
      const maxTemp = Math.max(...temps)
      const margin = (maxTemp - minTemp) * 0.1 || 2
      yMin = Math.floor(minTemp - margin)
      yMax = Math.ceil(maxTemp + margin)
    }
  }

  if (selected === "hum") {
    const hums = formattedData
      .map((d) => d.humedad_exterior_pct)
      .filter((h): h is number => h !== undefined)
    if (hums.length) {
      const minHum = Math.min(...hums)
      const maxHum = Math.max(...hums)
      const margin = (maxHum - minHum) * 0.1 || 5
      yMin = Math.max(0, Math.floor(minHum - margin))
      yMax = Math.min(100, Math.ceil(maxHum + margin))
    }
  }

  return (
    <div className="w-full">
      {/* Botones para seleccionar qué mostrar */}
      <div className="flex gap-4 mb-4 items-center">
        <button
          className={`px-4 py-1 rounded ${selected === "temp" ? "bg-red-500 text-white" : "bg-gray-200"}`}
          onClick={() => setSelected("temp")}
        >
          Temperatura
        </button>
        <button
          className={`px-4 py-1 rounded ${selected === "hum" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setSelected("hum")}
        >
          Humedad
        </button>
      </div>

      {/* Contenedor de la gráfica responsive */}
      <div className="w-full bg-white rounded-xl shadow border p-4 h-[300px] md:h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 20, right: 40, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis domain={[yMin, yMax]} stroke="#94a3b8" />
            <Tooltip />
            <Legend />
            {selected === "temp" && (
              <Area
                name="Temperatura (°C)"
                type="natural"
                dataKey="temperatura_exterior_C"
                stroke="#d72b22"
                fill="#d72b22"
                fillOpacity={0.1}
                strokeWidth={2.3}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
            )}
            {selected === "hum" && (
              <Area
                name="Humedad (%)"
                type="natural"
                dataKey="humedad_exterior_pct"
                stroke="#4376b6"
                fill="#4376b6"
                fillOpacity={0.1}
                strokeWidth={2.3}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
