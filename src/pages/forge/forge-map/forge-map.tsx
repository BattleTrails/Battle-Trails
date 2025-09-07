// Hooks de React
import {useCallback, useEffect, useState} from "react";

// Tipado de coordenadas GeoPoint desde Firestore
import {GeoPoint} from "firebase/firestore";

// Store global para estado del post
import {usePostStore} from "@/store/usePostStore.ts";

// Componentes Leaflet
import LeafletMap from "@/components/ui/leaflet-map/leaflet-map";
import LeafletSearch from "@/components/ui/leaflet-search/leaflet-search";

// Servicio de geocodificación
import { GeocodingResult, latLngToGeoPoint, reverseGeocode } from "@/services/geocoding-service";

// Icono para eliminar puntos
import {X} from "lucide-react";

type Props = {
  onRemoveWaypoint: (index: number) => void;
};

const ForgeMap = ({ onRemoveWaypoint }: Props) => {
  const { postDraft, setPostField } = usePostStore();
  const [activeMarkerIndex, setActiveMarkerIndex] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.4168, -3.7038]);
  const [isProcessingClick, setIsProcessingClick] = useState(false);

  // Límite máximo de paradas
  const MAX_ROUTE_POINTS = 10;

  // Verificar si una ubicación ya existe en la ruta
  const isDuplicateLocation = (newGeoPoint: GeoPoint): boolean => {
    return postDraft.routePoints.some(point => {
      const distance = calculateDistance(
        point.geoPoint.latitude,
        point.geoPoint.longitude,
        newGeoPoint.latitude,
        newGeoPoint.longitude
      );
      return distance < 100; // Menos de 100 metros se considera duplicado
    });
  };

  // Calcular distancia entre dos puntos en metros
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Actualizar centro del mapa cuando se añaden puntos
  useEffect(() => {
    if (postDraft.routePoints.length > 0) {
      const lastPoint = postDraft.routePoints[postDraft.routePoints.length - 1];
      setMapCenter([lastPoint.geoPoint.latitude, lastPoint.geoPoint.longitude]);
    }
  }, [postDraft.routePoints]);

  // Manejar selección de lugar desde la búsqueda
  const handlePlaceSelect = useCallback((result: GeocodingResult) => {
    // Verificar límite máximo de paradas
    if (postDraft.routePoints.length >= MAX_ROUTE_POINTS) {
      alert(`No puedes añadir más de ${MAX_ROUTE_POINTS} paradas en una ruta`);
      return;
    }

    const geoPoint = latLngToGeoPoint(result.lat, result.lng);

    // Verificar si la ubicación ya existe
    if (isDuplicateLocation(geoPoint)) {
      alert("Esta ubicación ya está añadida a tu ruta");
      return;
    }

    // Añadir el nuevo punto
    setPostField("routePoints", [
      ...postDraft.routePoints,
      {
        address: result.displayName,
        geoPoint,
        images: []
      },
    ]);

    // Actualizar centro del mapa
    setMapCenter([result.lat, result.lng]);
  }, [postDraft.routePoints, setPostField]);

  // Manejar click en marcador
  const handleMarkerClick = (index: number) => {
    setActiveMarkerIndex(activeMarkerIndex === index ? null : index);
  };

  // Manejar click en el mapa para añadir punto
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    // Verificar límite máximo de paradas
    if (postDraft.routePoints.length >= MAX_ROUTE_POINTS) {
      alert(`No puedes añadir más de ${MAX_ROUTE_POINTS} paradas en una ruta`);
      return;
    }

    // Evitar múltiples clicks mientras se procesa
    if (isProcessingClick) return;

    const geoPoint = latLngToGeoPoint(lat, lng);

    // Verificar si la ubicación ya existe
    if (isDuplicateLocation(geoPoint)) {
      alert("Esta ubicación ya está añadida a tu ruta");
      return;
    }

    setIsProcessingClick(true);

    try {
      // Obtener la dirección usando geocodificación inversa
      const address = await reverseGeocode(lat, lng);
      
      // Añadir el nuevo punto con la dirección obtenida
      setPostField("routePoints", [
        ...postDraft.routePoints,
        {
          address: address,
          geoPoint,
          images: []
        },
      ]);

      // Actualizar centro del mapa
      setMapCenter([lat, lng]);
    } catch (error) {
      console.error("Error al obtener la dirección:", error);
      // Fallback: usar coordenadas si falla la geocodificación
      setPostField("routePoints", [
        ...postDraft.routePoints,
        {
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          geoPoint,
          images: []
        },
      ]);
      setMapCenter([lat, lng]);
    } finally {
      setIsProcessingClick(false);
    }
  }, [postDraft.routePoints, setPostField, isProcessingClick]);

  // Eliminar un punto concreto
  const handleDeletePoint = (index: number) => {
    const newRoutePoints = postDraft.routePoints.filter((_, i) => i !== index);
    setPostField("routePoints", newRoutePoints);

    // Si eliminamos el punto activo, cerramos el overlay
    if (activeMarkerIndex === index) {
      setActiveMarkerIndex(null);
    } else if (activeMarkerIndex !== null && activeMarkerIndex > index) {
      // Si el punto activo está después del eliminado, ajustamos su índice
      setActiveMarkerIndex(activeMarkerIndex - 1);
    }
  };

  // Placeholder dinámico según si hay puntos añadidos
  const placeholderText = (() => {
    if (postDraft.routePoints.length === 0) {
      return "Busca la primera ubicación...";
    }
    if (postDraft.routePoints.length >= MAX_ROUTE_POINTS) {
      return `Límite alcanzado (${MAX_ROUTE_POINTS} paradas máximo)`;
    }
    return `Busca tu parada ${postDraft.routePoints.length + 1}...`;
  })();

  // Obtener coordenadas de waypoints para el mapa
  const waypoints = postDraft.routePoints.map(point => point.geoPoint);
  const addresses = postDraft.routePoints.map(point => point.address);

  return (
    <div className="space-y-4">
      {/* Búsqueda de lugares */}
      <LeafletSearch
        onPlaceSelect={handlePlaceSelect}
        placeholder={placeholderText}
        disabled={postDraft.routePoints.length >= MAX_ROUTE_POINTS}
        className="w-full"
      />

      {/* Mapa */}
      <div className="relative rounded-lg overflow-hidden border border-gray-200">
        <LeafletMap
          waypoints={waypoints}
          addresses={addresses}
          onMarkerClick={handleMarkerClick}
          onMapClick={handleMapClick}
          center={mapCenter}
          zoom={postDraft.routePoints.length ? 8 : 5}
          height="250px"
          showMarkers={true}
          className="rounded-lg"
        />

        {/* Overlay con información del marcador activo */}
        {activeMarkerIndex !== null && (
          <div className="absolute top-3 left-3 right-3 z-10">
            <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-600">
                      {activeMarkerIndex + 1}
                    </span>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {postDraft.routePoints[activeMarkerIndex]?.address}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {postDraft.routePoints[activeMarkerIndex]?.geoPoint.latitude.toFixed(6)}, 
                    {postDraft.routePoints[activeMarkerIndex]?.geoPoint.longitude.toFixed(6)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onRemoveWaypoint(activeMarkerIndex);
                    handleDeletePoint(activeMarkerIndex);
                  }}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Eliminar punto"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instrucciones */}
        {postDraft.routePoints.length === 0 && (
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Busca una ubicación o haz clic en el mapa para añadir puntos a tu ruta
              </p>
            </div>
          </div>
        )}

        {/* Indicador de procesamiento */}
        {isProcessingClick && (
          <div className="absolute top-3 left-3 right-3 z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-600">
                  Obteniendo dirección...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de puntos añadidos */}
      {postDraft.routePoints.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Puntos de la ruta ({postDraft.routePoints.length}/{MAX_ROUTE_POINTS})
          </h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {postDraft.routePoints.map((point, index) => (
              <div
                key={`${point.geoPoint.latitude}-${point.geoPoint.longitude}-${index}`}
                className={`flex items-center justify-between p-2 rounded border ${
                  activeMarkerIndex === index 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs font-bold text-gray-600 bg-white rounded-full w-5 h-5 flex items-center justify-center">
                    {index + 1}
                  </span>
                  <p className="text-sm text-gray-900 truncate">
                    {point.address}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onRemoveWaypoint(index);
                    handleDeletePoint(index);
                  }}
                  className="text-red-500 hover:text-red-700 p-1 ml-2"
                  title="Eliminar punto"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgeMap;