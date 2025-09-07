import { useEffect, useRef, useState } from "react";
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

// Componente para manejar clicks en el mapa
interface MapClickHandlerProps {
  onMapClick?: (lat: number, lng: number) => void;
}

const MapClickHandler = ({ onMapClick }: MapClickHandlerProps) => {
  const map = useMap();

  useEffect(() => {
    if (!onMapClick) return;

    const handleClick = (e: any) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  return null;
};

// Props del componente principal
interface LeafletMapProps {
  waypoints: GeoPoint[];
  addresses?: string[];
  onMarkerClick?: (index: number) => void;
  onMapClick?: (lat: number, lng: number) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  showMarkers?: boolean;
  showRoutes?: boolean;
  className?: string;
}

const LeafletMap = ({
  waypoints,
  addresses = [],
  onMarkerClick,
  onMapClick,
  center = [40.4168, -3.7038], // Madrid por defecto
  zoom = 8,
  height = "250px",
  showMarkers = true,
  showRoutes = false,
  className = ""
}: LeafletMapProps) => {
  const [activeMarker, setActiveMarker] = useState<number | null>(null);

  const handleMarkerClick = (index: number) => {
    setActiveMarker(activeMarker === index ? null : index);
    onMarkerClick?.(index);
  };


  return (
    <div className={`leaflet-map-container ${className}`} style={{ height }}>
      <MapContainer
        center={center}
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
        
        {/* Manejar clicks en el mapa */}
        <MapClickHandler onMapClick={onMapClick} />

        {/* Marcadores personalizados */}
        {showMarkers && waypoints.map((waypoint, index) => {
          const markerIcon = markerIcons[index] || markerIcons[markerIcons.length - 1];
          const customIcon = createCustomIcon(markerIcon);
          const address = addresses[index] || `Punto ${index + 1}`;

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
                <div className="p-2">
                  <div className="font-semibold text-sm">
                    {address}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {waypoint.latitude.toFixed(6)}, {waypoint.longitude.toFixed(6)}
                  </div>
                  {activeMarker === index && (
                    <div className="mt-2 text-xs text-blue-600">
                      Marcador activo
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
