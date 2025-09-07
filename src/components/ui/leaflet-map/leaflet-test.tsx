import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngTuple } from "leaflet";

const LeafletTest = () => {
  const position: LatLngTuple = [40.4168, -3.7038]; // Madrid

  return (
    <div style={{ height: "300px", width: "100%", border: "2px solid red" }}>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%", border: "2px solid blue" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            ¡Hola! Este es un mapa de prueba de Leaflet.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LeafletTest;
