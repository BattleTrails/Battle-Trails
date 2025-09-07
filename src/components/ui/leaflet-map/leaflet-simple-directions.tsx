import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { GeoPoint } from "firebase/firestore";
import { LatLngTuple } from "leaflet";

interface Props {
  waypoints: GeoPoint[];
  addresses?: string[];
}

const LeafletSimpleDirections = ({ waypoints, addresses = [] }: Props) => {
  console.log("LeafletSimpleDirections - waypoints:", waypoints);
  console.log("LeafletSimpleDirections - addresses:", addresses);

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
        
        {waypoints.map((waypoint, index) => (
          <Marker
            key={`${waypoint.latitude}-${waypoint.longitude}-${index}`}
            position={[waypoint.latitude, waypoint.longitude]}
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
        ))}
      </MapContainer>
    </div>
  );
};

export default LeafletSimpleDirections;
