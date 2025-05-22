import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useEffect, useState } from "react";

interface LatLng {
  lat: number;
  lng: number;
}

interface Props {
  waypoints: LatLng[];
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

const MapRoute = ({ waypoints }: Props) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  useEffect(() => {
    if (!isLoaded || waypoints.length < 2) return;

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: waypoints[0],
        destination: waypoints[waypoints.length - 1],
        waypoints: waypoints.slice(1, -1).map((point) => ({
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
  }, [isLoaded, waypoints]);

  if (!isLoaded) {
    return <p className="text-center">Cargando mapa...</p>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={waypoints[0] || { lat: 0, lng: 0 }}
      zoom={8}
    >
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
};

export default MapRoute;
