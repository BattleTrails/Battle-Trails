import { useState } from "react";
import { GeoPoint } from "firebase/firestore";


// Componente Leaflet para direcciones
import LeafletMapDirections from "@/components/ui/leaflet-map/leaflet-map-directions";

interface Props {
  waypoints: GeoPoint[];
  addresses?: string[]; // 👈 Opcional: nombres de las direcciones
}

const MapBaseDirections = ({ waypoints, addresses = [] }: Props) => {
  const [activeMarker, setActiveMarker] = useState<number | null>(null);

  const handleMarkerClick = (index: number) => {
    setActiveMarker(activeMarker === index ? null : index);
  };

  return (
    <div className="relative">
      <LeafletMapDirections
        waypoints={waypoints}
        addresses={addresses}
        onMarkerClick={handleMarkerClick}
        height="100%"
        showMarkers={true}
        showRoute={true}
        className="rounded-lg"
      />
    </div>
  );
};

export default MapBaseDirections;