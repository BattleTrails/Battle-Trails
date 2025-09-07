import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { GeoPoint } from "firebase/firestore";
import { LatLngTuple, Icon } from "leaflet";
import { markerIcons } from "@assets/markers";

interface Props {
  waypoints: GeoPoint[];
  addresses?: string[];
}

// Icono personalizado numerado
const createCustomIcon = (iconUrl: string, size: [number, number] = [40, 40]) => {
  return new Icon({
    iconUrl,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, -size[1]],
    className: "custom-marker",
  });
};

const LeafletSimpleDirections = ({ waypoints, addresses = [] }: Props) => {

  if (waypoints.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded">
        <p className="text-gray-500">No hay puntos de ruta para mostrar</p>
      </div>
    );
  }

  // Usar el primer waypoint como centro
  const center: LatLngTuple = [waypoints[0].latitude, waypoints[0].longitude];

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {waypoints.map((waypoint, index) => {
          const markerIcon = markerIcons[index] || markerIcons[markerIcons.length - 1];
          const customIcon = createCustomIcon(markerIcon);

          return (
            <Marker
              key={`${waypoint.latitude}-${waypoint.longitude}-${index}`}
              position={[waypoint.latitude, waypoint.longitude]}
              icon={customIcon}
            >
              <Popup>
                <div>
                  <strong>Punto {index + 1}</strong>
                  <br />
                  {addresses[index] || "Sin dirección"}
                  <br />
                  <small>
                    {waypoint.latitude.toFixed(6)}, {waypoint.longitude.toFixed(6)}
                  </small>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default LeafletSimpleDirections;
