"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, X } from "lucide-react";

export function WebcamStream() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [streamUrl, setStreamUrl] = useState("/placeholder.svg?height=200&width=400");
  const [error, setError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Definimos la ruta base de la imagen que se actualiza en public/webcam/fto.jpg.
  const baseImageUrl = "https://meteomagina.es/foto.jpg";

  // La función refreshStream actualiza la URL con un timestamp para forzar que el navegador cargue la versión actualizada.
  const refreshStream = () => {
    setIsPlaying(true);
    setError(false);
    setStreamUrl(`${baseImageUrl}?t=${Date.now()}`);
  };

  useEffect(() => {
    refreshStream();
    // Actualiza la imagen cada 30 segundos o en el intervalo que requieras.
    const interval = setInterval(refreshStream, 300000);
    return () => clearInterval(interval);
  }, []);

  // (Opcional) Simulación de error aleatorio.
  useEffect(() => {
    const simulateRandomError = () => {
      if (Math.random() < 0.1) {
        setError(true);
      }
    };
    const errorInterval = setInterval(simulateRandomError, 30000);
    return () => clearInterval(errorInterval);
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleImageError = () => {
    setError(true);
    setStreamUrl("/placeholder.svg?height=200&width=400");
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="relative aspect-video overflow-hidden rounded-md bg-slate-100">
        {error ? (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <p className="mb-4 text-slate-600">Error al cargar la transmisión</p>
            <Button variant="outline" size="sm" onClick={refreshStream}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        ) : (
          <>
            <img
              src={isPlaying ? streamUrl : "/placeholder.svg?height=200&width=400"}
              alt="Transmisión en vivo"
              className="h-full w-full object-cover cursor-pointer"
              onClick={openModal}
              onError={handleImageError}
            />
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <p className="text-lg font-medium text-white">Transmisión pausada</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-center mt-4">
        <Button variant="outline" size="sm" onClick={refreshStream}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="relative flex justify-center items-center">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-white text-black rounded-full p-2 shadow-lg hover:bg-gray-200 transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={isPlaying ? streamUrl : "/placeholder.svg?height=200&width=400"}
              alt="Transmisión en vivo"
              className="max-w-[90%] max-h-[80vh] object-contain shadow-lg rounded-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}
