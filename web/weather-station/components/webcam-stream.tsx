"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronLeft, ChevronRight, X } from "lucide-react";

export function WebcamStream() {
  const [streamUrl, setStreamUrl] = useState("/api/fotos/foto.webp");
  const [error, setError] = useState(false);

  const [photoHistory, setPhotoHistory] = useState<
    { webp: string; jpg: string }[]
  >([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const PRELOAD = 20; // Cantidad de fotos a precargar antes y después

  const refreshStream = () => {
    setError(false);
    setStreamUrl(`/api/fotos/foto.webp?t=${Date.now()}`);
  };

  const handleImageError = () => {
    setError(true);
  };

  const showPreviousPhoto = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const showNextPhoto = () => {
    setCurrentIndex((prev) =>
      Math.min(prev + 1, photoHistory.length - 1)
    );
  };

  const fetchPhotos = async () => {
    try {
      const res = await fetch("/api/fotos");
      const data = await res.json();
      if (data.photos) {
        const lastPhotoChanged =
          photoHistory.length === 0 ||
          photoHistory[photoHistory.length - 1].webp !==
            data.photos[data.photos.length - 1].webp;

        setPhotoHistory(data.photos);

        if (lastPhotoChanged && currentIndex === photoHistory.length - 1) {
          setCurrentIndex(data.photos.length - 1);
          refreshStream();
        } else if (photoHistory.length === 0) {
          setCurrentIndex(data.photos.length - 1);
        }
      }
    } catch (err) {
      console.error("Error cargando fotos:", err);
    }
  };

  // Precarga imágenes alrededor del índice actual
  useEffect(() => {
    if (photoHistory.length === 0) return;

    const start = Math.max(currentIndex - PRELOAD, 0);
    const end = Math.min(
      currentIndex + PRELOAD,
      photoHistory.length - 1
    );

    for (let i = start; i <= end; i++) {
      const img = new Image();
      img.src = `/api/fotos/${photoHistory[i].webp.split("/").pop()}`;
    }
  }, [currentIndex, photoHistory]);

  // Inicial
  useEffect(() => {
    refreshStream();
    fetchPhotos();

    const interval = setInterval(() => {
      fetchPhotos();
      refreshStream();
    }, 300000); // refresca cada 5 minutos

    return () => clearInterval(interval);
  }, []);

  // Quitar scroll cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "auto";
  }, [modalOpen]);

  return (
    <div className="flex flex-col space-y-4">
      {/* Botón de actualizar */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refreshStream();
            fetchPhotos();
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      <div className="relative w-full overflow-hidden rounded-md bg-slate-100 flex items-center justify-center">
  {error ? (
    <p className="text-slate-600">Error al cargar la imagen</p>
  ) : (
    <>
      {/* Flecha izquierda */}
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-200 p-2 text-slate-700 hover:bg-slate-300 z-10"
        onClick={showPreviousPhoto}
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Imagen del slider */}
      <div
        className="relative w-full flex justify-center"
        onClick={() => setModalOpen(true)}
      >
        <img
          src={
            photoHistory[currentIndex]
              ? `/api/fotos/${photoHistory[currentIndex].webp
                  .split("/")
                  .pop()}?t=${Date.now()}`
              : streamUrl
          }
          alt="Transmisión / Histórico"
          className="max-h-[80vh] max-w-full object-contain rounded-md"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-black/0 transition-all" />
      </div>

      {/* Flecha derecha */}
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-200 p-2 text-slate-700 hover:bg-slate-300 z-10"
        onClick={showNextPhoto}
        disabled={currentIndex === photoHistory.length - 1}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </>
  )}
</div>


      {/* Slider de fotos */}
      {photoHistory.length > 0 && (
        <div className="flex items-center space-x-2 px-2">
          <span className="text-sm text-slate-600">
            {photoHistory[currentIndex].webp
              .split("/")
              .pop()
              ?.replace(".webp", "")}
          </span>
          <input
            type="range"
            min={0}
            max={photoHistory.length - 1}
            value={currentIndex}
            onChange={(e) => setCurrentIndex(Number(e.target.value))}
            className="w-full accent-slate-700"
          />
        </div>
      )}

      {/* Modal con imagen JPG más pequeña */}
      {modalOpen && photoHistory[currentIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="relative max-w-[80vw] max-h-[80vh] p-4 bg-black/0 flex items-center justify-center">
            {/* Cerrar modal */}
            <button
              className="absolute top-2 right-2 p-2 text-white bg-black/50 rounded-full hover:bg-black/70"
              onClick={() => setModalOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Imagen JPG modal */}
            <img
              src={`/api/fotos/${photoHistory[currentIndex].jpg
                .split("/")
                .pop()}?t=${Date.now()}`}
              alt="Foto JPG"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}
