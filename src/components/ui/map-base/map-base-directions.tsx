import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer, Libraries,
} from "@react-google-maps/api";
import { useEffect, useState, useMemo } from "react";
import { GeoPoint } from "firebase/firestore";

// 👉 Constante estática para evitar warning de performance
const GOOGLE_MAP_LIBRARIES: Libraries = ["places"];

interface Props {
  waypoints: GeoPoint[];
}

const containerStyle = {
  width: "100%",
  height: "250px",
};

const geoPointToLatLng = (point: GeoPoint): { lat: number; lng: number } => ({
  lat: point.latitude,
  lng: point.longitude,
});

const MapBaseDirections = ({ waypoints }: Props) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [travelMode, setTravelMode] = useState<google.maps.TravelMode | null>(null);

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
        } else {
          console.error("Error al calcular ruta:", status);
        }
      }
    );
  }, [isLoaded, latLngWaypoints, travelMode]);

  if (!isLoaded) return <p className="text-center">Cargando mapa...</p>;

  return (
    <>
      {/*<div className="flex gap-2 justify-evenly mb-2">
        <button
          onClick={() => setTravelMode(google.maps.TravelMode.DRIVING)}
          className={`btn btn-xs ${
            travelMode === google.maps.TravelMode.DRIVING
              ? "btn-primary"
              : "btn-outline"
          }`}
        >
          🚗 Coche
        </button>
        <button
          onClick={() => setTravelMode(google.maps.TravelMode.WALKING)}
          className={`btn btn-xs ${
            travelMode === google.maps.TravelMode.WALKING
              ? "btn-primary"
              : "btn-outline"
          }`}
        >
          🚶 A pie
        </button>
      </div>*/}

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
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </>
  );
};

export default MapBaseDirections;
