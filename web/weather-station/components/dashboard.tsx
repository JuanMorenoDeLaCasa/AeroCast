"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { TemperatureGauge } from "@/components/temperature-gauge"
import { HumidityGauge } from "@/components/humidity-gauge"
import { ChartDashboard } from "@/components/chart-dashboard"
import { WebcamStream } from "@/components/webcam-stream"
import { subHours, subDays } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type CurrentData = {
  temperatura_exterior_C: number
  humedad_exterior_pct: number
}

export default function Dashboard() {
  const [currentData, setCurrentData] = useState<CurrentData>({ temperatura_exterior_C: 0, humedad_exterior_pct: 0 })
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState<string>("3h")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 1),
    to: new Date(),
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [configError, setConfigError] = useState<boolean>(false)
  const [configDetails, setConfigDetails] = useState<any>({})
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isHistoricalLoading, setIsHistoricalLoading] = useState<boolean>(false)

  // Check if InfluxDB is configured
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await fetch("/api/influxdb-config")
        const data = await response.json()

        setConfigDetails(data.config || {})

        if (!data.isConfigured) {
          setConfigError(true)
          setError("InfluxDB no está configurado correctamente. Verifique las variables de entorno.")
        }
      } catch (err) {
        console.error("Error checking InfluxDB configuration:", err)
        setConfigError(true)
        setError("Error al verificar la configuración de InfluxDB.")
      }
    }

    checkConfig()
  }, [])

  // Fetch current data with auto-refresh
  useEffect(() => {
    if (configError) return

    const fetchData = async () => {
      try {
        setError(null)
        const response = await fetch("/api/current-data")

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al obtener datos actuales")
        }

        const data: CurrentData = await response.json()
        setCurrentData(data)
        setLastUpdated(new Date())
      } catch (err: any) {
        console.error("Error fetching current data:", err)
        setError(`Error al obtener datos actuales: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const intervalId = setInterval(fetchData, 30000)
    return () => clearInterval(intervalId)
  }, [configError])

  const fetchHistoricalData = useCallback(async (start: Date, end: Date) => {
    setIsHistoricalLoading(true)
    try {
      setError(null)

      const response = await fetch("/api/historical-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start: start.toISOString(), end: end.toISOString() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al obtener datos históricos")
      }

      const data = await response.json()
      setHistoricalData(data)
    } catch (err: any) {
      console.error("Error fetching historical data:", err)
      setError(`Error al obtener datos históricos: ${err.message}`)
    } finally {
      setIsHistoricalLoading(false)
    }
  }, [])

  useEffect(() => {
    if (configError) return

    let start,
      end = new Date()

    if (timeRange !== "custom") {
      switch (timeRange) {
        case "3h": start = subHours(end, 3); break
        case "6h": start = subHours(end, 6); break
        case "12h": start = subHours(end, 12); break
        case "1d": start = subDays(end, 1); break
        case "7d": start = subDays(end, 7); break
        default: start = subHours(end, 3)
      }
      fetchHistoricalData(start, end)
    } else {
      if (dateRange.from && dateRange.to) fetchHistoricalData(dateRange.from, dateRange.to)
    }
  }, [timeRange, dateRange, configError, fetchHistoricalData])

  const handleTimeRangeChange = (value: string) => setTimeRange(value)
  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    if (range.from && range.to) {
      setTimeRange("custom")
      setDateRange(range)
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      setError(null)
      const currentResponse = await fetch("/api/current-data")
      if (!currentResponse.ok) {
        const errorData = await currentResponse.json()
        throw new Error(errorData.error || "Error al obtener datos actuales")
      }
      const currentData: CurrentData = await currentResponse.json()
      setCurrentData(currentData)
      setLastUpdated(new Date())

      let start, end = new Date()
      if (timeRange !== "custom") {
        switch (timeRange) {
          case "3h": start = subHours(end, 3); break
          case "6h": start = subHours(end, 6); break
          case "12h": start = subHours(end, 12); break
          case "1d": start = subDays(end, 1); break
          case "7d": start = subDays(end, 7); break
          default: start = subHours(end, 3)
        }
      } else { start = dateRange.from; end = dateRange.to }
      await fetchHistoricalData(start, end)
    } catch (err: any) {
      console.error("Error refreshing data:", err)
      setError(`Error al actualizar los datos: ${err.message}`)
    } finally { setLoading(false) }
  }

  if (configError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error de configuración</AlertTitle>
        <AlertDescription>
          <p>InfluxDB no está configurado correctamente. Verifique las siguientes variables de entorno:</p>
          <ul className="mt-2 list-disc pl-5">
            <li>INFLUXDB_URL: {configDetails.url}</li>
            <li>INFLUXDB_TOKEN: {configDetails.token}</li>
            <li>INFLUXDB_ORG: {configDetails.org}</li>
            <li>INFLUXDB_BUCKET: {configDetails.bucket || 'No configurado (usando valor predeterminado "Sensores")'}</li>
          </ul>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid gap-6">
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        {lastUpdated && (
          <p className="text-sm text-muted-foreground">Última actualización: {lastUpdated.toLocaleTimeString()}</p>
        )}
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar datos
        </Button>
      </div>

      {/* Layout actualizado con tres columnas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="flex flex-col items-center justify-center">
          <CardHeader className="pb-2">
            <CardTitle>Temperatura Actual</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <TemperatureGauge value={currentData.temperatura_exterior_C} />
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center">
          <CardHeader className="pb-2">
            <CardTitle>Humedad Actual</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <HumidityGauge value={currentData.humedad_exterior_pct} />
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
  <CardHeader className="pb-2">
    <CardTitle>Timelapses</CardTitle>
  </CardHeader>
  <CardContent className="flex-1 flex items-center justify-center">
    <Link href="/timelapses" className="text-blue-500 hover:underline text-lg font-medium">
      Ver Timelapses
    </Link>
  </CardContent>
</Card>


        {/* Webcam a lo ancho debajo */}
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle>Cámara en Vivo</CardTitle>
          </CardHeader>
          <CardContent>
            <WebcamStream images={historicalData.map(d => d.imageUrl).filter(Boolean)} />
          </CardContent>
        </Card>
      </div>

      {/* Historical Data Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Datos Históricos</CardTitle>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <Tabs defaultValue="3h" value={timeRange} onValueChange={handleTimeRangeChange}>
              <TabsList>
                <TabsTrigger value="3h">3h</TabsTrigger>
                <TabsTrigger value="6h">6h</TabsTrigger>
                <TabsTrigger value="12h">12h</TabsTrigger>
                <TabsTrigger value="1d">1 día</TabsTrigger>
                <TabsTrigger value="7d">7 días</TabsTrigger>
                <TabsTrigger value="custom">Personalizado</TabsTrigger>
              </TabsList>
            </Tabs>
            <DatePickerWithRange date={dateRange} onDateChange={handleDateRangeChange} />
          </div>
        </CardHeader>
        <CardContent>
          {isHistoricalLoading ? (
            <div className="flex h-[300px] items-center justify-center text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : historicalData.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-center text-muted-foreground">
              No hay datos disponibles para el período seleccionado
            </div>
          ) : (
            <ChartDashboard data={historicalData} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
