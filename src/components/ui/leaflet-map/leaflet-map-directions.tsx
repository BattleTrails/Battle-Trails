import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon, LatLngBounds, LatLngTuple } from "leaflet";
import { GeoPoint } from "firebase/firestore";
import { markerIcons } from "@assets/markers";

// Configuración de iconos personalizados
const createCustomIcon = (iconUrl: string, size: [number, number] = [40, 40]) => {
  return new Icon({
    iconUrl,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, -size[1]],
    className: "custom-marker"
  });
};

// Componente para ajustar los límites del mapa
interface MapBoundsProps {
  waypoints: GeoPoint[];
}

const MapBounds = ({ waypoints }: MapBoundsProps) => {
  const map = useMap();

  useEffect(() => {
    if (waypoints.length === 0) return;

    const bounds = new LatLngBounds([]);
    waypoints.forEach(waypoint => {
      bounds.extend([waypoint.latitude, waypoint.longitude]);
    });

    map.fitBounds(bounds, { padding: [20, 20] });
    
    // Asegurar zoom mínimo
    const currentZoom = map.getZoom();
    if (currentZoom && currentZoom > 15) {
      map.setZoom(15);
    }
  }, [waypoints, map]);

  return null;
};

// Props del componente principal
interface LeafletMapDirectionsProps {
  waypoints: GeoPoint[];
  addresses?: string[];
  onMarkerClick?: (index: number) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  showMarkers?: boolean;
  showRoute?: boolean;
  className?: string;
}

const LeafletMapDirections = ({
  waypoints,
  addresses = [],
  onMarkerClick,
  center,
  zoom = 8,
  height = "100%",
  showMarkers = true,
  className = ""
}: LeafletMapDirectionsProps) => {
  const [activeMarker, setActiveMarker] = useState<number | null>(null);

  // Debug: verificar que los waypoints se reciban correctamente
  console.log("LeafletMapDirections - waypoints:", waypoints);
  console.log("LeafletMapDirections - addresses:", addresses);

  // Calcular centro del mapa si no se proporciona
  const mapCenter = useMemo(() => {
    if (center) return center;
    if (waypoints.length === 0) return [40.4168, -3.7038] as LatLngTuple;
    return [waypoints[0].latitude, waypoints[0].longitude] as LatLngTuple;
  }, [center, waypoints]);

  // Ya no se dibuja línea de ruta; solo marcadores y bounds

  const handleMarkerClick = (index: number) => {
    setActiveMarker(activeMarker === index ? null : index);
    onMarkerClick?.(index);
  };

  // Calcular distancia total de la ruta
  const calculateTotalDistance = (): string => {
    if (waypoints.length < 2) return "0 km";

    let totalDistance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const distance = calculateDistance(
        waypoints[i].latitude,
        waypoints[i].longitude,
        waypoints[i + 1].latitude,
        waypoints[i + 1].longitude
      );
      totalDistance += distance;
    }

    if (totalDistance < 1000) {
      return `${Math.round(totalDistance)} m`;
    } else {
      return `${(totalDistance / 1000).toFixed(1)} km`;
    }
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

  // Si no hay waypoints, mostrar un mensaje
  if (waypoints.length === 0) {
    return (
      <div className={`leaflet-map-container ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full bg-gray-100 rounded">
          <p className="text-gray-500">No hay puntos de ruta para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`leaflet-map-container ${className}`} style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Ajustar límites del mapa */}
        <MapBounds waypoints={waypoints} />

        {/* Sin línea de ruta */}

        {/* Marcadores personalizados */}
        {showMarkers && waypoints.map((waypoint, index) => {
          const markerIcon = markerIcons[index] || markerIcons[markerIcons.length - 1];
          const customIcon = createCustomIcon(markerIcon);
          const address = addresses[index] || `Punto ${index + 1}`;
          const isOrigin = index === 0;
          const isDestination = index === waypoints.length - 1;

          return (
            <Marker
              key={`${waypoint.latitude}-${waypoint.longitude}-${index}`}
              position={[waypoint.latitude, waypoint.longitude]}
              icon={customIcon}
              eventHandlers={{
                click: () => handleMarkerClick(index)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-gray-600 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900">
                        {address}
                      </div>
                      <div className="text-xs text-gray-500">
                        {waypoint.latitude.toFixed(6)}, {waypoint.longitude.toFixed(6)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Información específica del punto */}
                  <div className="text-xs text-gray-600 space-y-1">
                    {isOrigin && (
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        🚀 Punto de inicio
                      </div>
                    )}
                    {isDestination && waypoints.length > 1 && (
                      <div className="bg-red-100 text-red-800 px-2 py-1 rounded">
                        🏁 Destino final
                      </div>
                    )}
                    {!isOrigin && !isDestination && (
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        📍 Parada intermedia
                      </div>
                    )}
                  </div>

                  {/* Distancia desde el punto anterior */}
                  {index > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        Distancia desde punto anterior: {
                          (() => {
                            const distance = calculateDistance(
                              waypoints[index - 1].latitude,
                              waypoints[index - 1].longitude,
                              waypoint.latitude,
                              waypoint.longitude
                            );
                            return distance < 1000 
                              ? `${Math.round(distance)} m`
                              : `${(distance / 1000).toFixed(1)} km`;
                          })()
                        }
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Información de la ruta */}
      {waypoints.length > 1 && (
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-900">
            Información de la ruta
          </div>
          <div className="text-xs text-gray-600 mt-1">
            <div>Puntos: {waypoints.length}</div>
            <div>Distancia total: {calculateTotalDistance()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeafletMapDirections;
