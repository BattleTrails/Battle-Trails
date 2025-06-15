import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
  Marker,
  OverlayView,
  Libraries,
} from "@react-google-maps/api";
import { useEffect, useState, useMemo, useRef } from "react";
import { GeoPoint } from "firebase/firestore";
import { X } from "lucide-react";

// Iconos personalizados de marcadores numerados
import { markerIcons } from "@assets/markers";

// 👉 Constante estática para evitar warning de performance
const GOOGLE_MAP_LIBRARIES: Libraries = ["places"];

interface Props {
  waypoints: GeoPoint[];
  addresses?: string[]; // 👈 Opcional: nombres de las direcciones
}

const containerStyle = {
  width: "100%",
  height: "250px",
};

const geoPointToLatLng = (point: GeoPoint): { lat: number; lng: number } => ({
  lat: point.latitude,
  lng: point.longitude,
});

const MapBaseDirections = ({ waypoints, addresses = [] }: Props) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [travelMode, setTravelMode] = useState<google.maps.TravelMode | null>(null);
  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    totalDistance: string;
    totalDuration: string;
    legs: Array<{ distance: string; duration: string }>;
  } | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAP_LIBRARIES,
  });

  const latLngWaypoints = useMemo(
    () => waypoints.map(geoPointToLatLng),
    [waypoints]
  );

  useEffect(() => {
    if (!isLoaded) return;

    if (!travelMode) {
      setTravelMode(google.maps.TravelMode.DRIVING);
      return;
    }

    if (latLngWaypoints.length < 2) return;

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: latLngWaypoints[0],
        destination: latLngWaypoints[latLngWaypoints.length - 1],
        waypoints: latLngWaypoints.slice(1, -1).map((point) => ({
          location: point,
          stopover: true,
        })),
        travelMode: travelMode,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);

          // Extraer información de la ruta
          const route = result.routes[0];
          if (route) {
            setRouteInfo({
              totalDistance: route.legs.reduce((acc, leg) => acc + (leg.distance?.value || 0), 0) / 1000 + " km",
              totalDuration: Math.round(route.legs.reduce((acc, leg) => acc + (leg.duration?.value || 0), 0) / 60) + " min",
              legs: route.legs.map(leg => ({
                distance: leg.distance?.text || "N/A",
                duration: leg.duration?.text || "N/A"
              }))
            });
          }
        } else {
          console.error("Error al calcular ruta:", status);
          setRouteInfo(null);
        }
      }
    );
  }, [isLoaded, latLngWaypoints, travelMode]);

  if (!isLoaded) return <p className="text-center">Cargando mapa...</p>;

  return (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={latLngWaypoints[0] || { lat: 0, lng: 0 }}
        zoom={8}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: true,
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {/* DirectionsRenderer SIN marcadores por defecto */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true, // 👈 Clave: suprime los marcadores por defecto
              polylineOptions: {
                strokeColor: "#4285F4",
                strokeWeight: 5,
                strokeOpacity: 0.8,
              }
            }}
          />
        )}

        {/* Marcadores personalizados numerados */}
        {latLngWaypoints.map((position, index) => {
          const markerIcon = markerIcons[index] || markerIcons[markerIcons.length - 1];
          const isOrigin = index === 0;
          const isDestination = index === latLngWaypoints.length - 1;

          const address = addresses[index] || `Punto ${index + 1}`;

          return (
            <div key={`waypoint-${index}-${position.lat}-${position.lng}`}>
              <Marker
                position={position}
                icon={{
                  url: markerIcon,
                  scaledSize: new window.google.maps.Size(40, 40),
                  anchor: new window.google.maps.Point(20, 20),
                }}
                zIndex={1000}
                onClick={() => {
                  setActiveMarker(activeMarker === index ? null : index);
                  mapRef.current?.panTo(position);
                }}
              />

              {/* Popup custom con OverlayView */}
              {activeMarker === index && (
                <OverlayView
                  position={position}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <div className="relative left-1/2 -translate-x-1/2 -translate-y-35 bg-white w-48 rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    {/* Header del popup */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-xs">{address}</h3>

                      </div>
                      <button
                        onClick={() => setActiveMarker(null)}
                        className="text-white hover:text-gray-200 transition-colors ml-2"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Contenido del popup */}
                    <div className="p-3">
                      {routeInfo && index < routeInfo.legs.length && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-700">Hasta siguiente:</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                              {routeInfo.legs[index].distance}
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                              {routeInfo.legs[index].duration}
                            </span>
                          </div>
                        </div>
                      )}

                      {isDestination && routeInfo && (
                        <div className="border-t border-gray-100 pt-2 mt-2">
                          <p className="text-xs font-medium text-gray-700 mb-1">Total:</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              {routeInfo.totalDistance}
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              {routeInfo.totalDuration}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Si es origen y no hay siguiente leg */}
                      {isOrigin && routeInfo && routeInfo.legs.length === 0 && (
                        <div className="text-center text-xs text-gray-500">
                          <p>Punto de inicio</p>
                        </div>
                      )}
                    </div>

                    {/* Flecha apuntando al marcador */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full">
                      <div className="w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-white"></div>
                    </div>
                  </div>
                </OverlayView>
              )}
            </div>
          );
        })}
      </GoogleMap>
    </>
  );
};

export default MapBaseDirections;