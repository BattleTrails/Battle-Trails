import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useEffect, useState, useMemo } from "react";
import { GeoPoint } from "firebase/firestore";

interface Props {
  waypoints: GeoPoint[];
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

const geoPointToLatLng = (point: GeoPoint): { lat: number; lng: number } => ({
  lat: point.latitude,
  lng: point.longitude,
});

const MapBaseDirections = ({ waypoints }: Props) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const latLngWaypoints = useMemo(
    () => waypoints.map(geoPointToLatLng),
    [waypoints]
  );

  useEffect(() => {
    if (!isLoaded || latLngWaypoints.length < 2) return;

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: latLngWaypoints[0],
        destination: latLngWaypoints[latLngWaypoints.length - 1],
        waypoints: latLngWaypoints.slice(1, -1).map((point) => ({
          location: point,
          stopover: true,
        })),
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        } else {
          console.error("Error al calcular ruta:", status);
        }
      }
    );
  }, [isLoaded, latLngWaypoints]);

  if (!isLoaded) return <p className="text-center">Cargando mapa...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={latLngWaypoints[0] || { lat: 0, lng: 0 }}
      zoom={8}
    >
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
};

export default MapBaseDirections;
