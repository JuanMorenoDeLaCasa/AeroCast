"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type Timelapse = {
  filename: string
  url: string
  date: string
  thumbnail: string
}

export default function TimelapsesPage() {
  const [timelapses, setTimelapses] = useState<Timelapse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Timelapse | null>(null)
  const modalContentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const fetchTimelapses = async () => {
      try {
        setError(null)
        const response = await fetch("/api/timelapses")
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al obtener timelapses")
        }
        const data = await response.json()
        setTimelapses(data.timelapses || [])
      } catch (err: any) {
        console.error("Error fetching timelapses:", err)
        setError(`Error al obtener timelapses: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchTimelapses()
  }, [])

  const handleCloseModal = () => setSelected(null)

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
      handleCloseModal()
    }
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando timelapses...</div>
  }

  if (timelapses.length === 0) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">No hay timelapses disponibles</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Timelapses</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {timelapses.map(t => (
          <Card
            key={t.filename}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelected(t)}
          >
            <CardHeader>
              <CardTitle className="text-sm text-center">{t.date}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative w-full">
                <img
                  src={t.thumbnail}
                  alt={t.date}
                  className="w-full h-auto rounded-b-md"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition">
                  <span className="text-white text-3xl">▶</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={handleOverlayClick}
        >
          <div
            ref={modalContentRef}
            className="bg-white p-4 rounded-xl shadow-xl max-w-3xl w-full relative"
          >
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
              onClick={handleCloseModal}
            >
              ✕
            </button>
            <video
              controls
              muted
              playsInline
              className="w-full rounded-lg"
              src={selected.url}
            />
            <p className="text-center mt-2">{selected.date}</p>
          </div>
        </div>
      )}
    </div>
  )
}
