import { useEffect, useRef, useState } from "react";
import type { Map, Marker } from "leaflet";

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  propertyName: string;
  className?: string;
}

export function PropertyMap({
  latitude,
  longitude,
  propertyName,
  className = "",
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current) return;

    let mounted = true;

    import("leaflet")
      .then((L) => {
        if (!mounted || !mapRef.current) return;

        // Fix Leaflet icon paths for webpack/vite
        const LeafletIcon = L.default.Icon.Default;
        if (LeafletIcon.prototype && "_getIconUrl" in LeafletIcon.prototype) {
          delete (LeafletIcon.prototype as { _getIconUrl?: unknown })._getIconUrl;
        }

        LeafletIcon.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = L.default
            .map(mapRef.current!)
            .setView([latitude, longitude], 15);

          L.default
            .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              maxZoom: 19,
            })
            .addTo(mapInstanceRef.current);

          markerRef.current = L.default.marker([latitude, longitude]).addTo(mapInstanceRef.current);
        } else {
          mapInstanceRef.current.setView([latitude, longitude], 15);
          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
          }
        }

        setError(null);
      })
      .catch((err) => {
        console.error("Failed to load Leaflet:", err);
        setError(
          "Mapa não disponível. Por favor, instale as dependências executando 'npm install'."
        );
      });

    import("leaflet/dist/leaflet.css").catch(() => {});

    const cleanup = () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };

    return cleanup;
  }, [isClient, latitude, longitude, propertyName]);

  if (!isClient) {
    return (
      <div
        className={`w-full h-full min-h-[400px] rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${className}`}
      >
        <p className="text-gray-500 dark:text-gray-400">Carregando mapa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`w-full h-full min-h-[400px] rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${className}`}
      >
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center px-4">{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={`w-full h-full min-h-[400px] rounded-lg ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
