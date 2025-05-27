// src/components/map/MapBase.tsx
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { ReactNode } from "react";

interface LatLng {
  lat: number;
  lng: number;
}

interface Props {
  center: LatLng;
  zoom?: number;
  children?: ReactNode;
  height?: string;
  width?: string;
}

const MapBase = ({
                    center,
                    zoom = 8,
                    children,
                    height = "400px",
                    width = "100%",
                  }: Props) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  if (!isLoaded) {
    return <p className="text-center">Cargando mapa...</p>;
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width, height }}
      center={center}
      zoom={zoom}
      options={{
        disableDefaultUI: true,
        clickableIcons: false,
        gestureHandling: "none",
      }}
    >
      {children}
    </GoogleMap>
  );
};

export default MapBase;
