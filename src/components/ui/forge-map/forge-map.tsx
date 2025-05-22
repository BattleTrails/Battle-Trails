// src/components/map/ForgeMap.tsx
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  Autocomplete,
} from "@react-google-maps/api";
import { useEffect, useRef } from "react";
import { GeoPoint } from "firebase/firestore";
import { usePostStore } from "@/store/usePostStore";
import ForgeInput from "@pages/forge/forge-input/forge-input.tsx";

// ✅ Corrección: mantener esta constante FUERA del componente
const libraries: ("places")[] = ["places"];

const containerStyle = {
  width: "100%",
  height: "200px",
};

const defaultCenter = { lat: 40.4168, lng: -3.7038 }; // Madrid por defecto

const ForgeMap = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { postDraft, setPostField } = usePostStore();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const geoPointToLatLng = (geo: GeoPoint) => ({
    lat: geo.latitude,
    lng: geo.longitude,
  });

  // 🗺️ Autoajuste del mapa a todos los puntos seleccionados
  useEffect(() => {
    if (!mapRef.current || postDraft.routePoints.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    postDraft.routePoints.forEach(({ geoPoint }) => {
      bounds.extend(geoPointToLatLng(geoPoint));
    });

    mapRef.current.fitBounds(bounds, 80);

    const listener = mapRef.current.addListener("bounds_changed", () => {
      const zoom = mapRef.current!.getZoom();
      if (zoom && zoom < 7) mapRef.current!.setZoom(5);
      google.maps.event.removeListener(listener);
    });
  }, [postDraft.routePoints]);

  // ➕ Añadir punto desde Autocomplete
  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    const location = place?.geometry?.location;
    if (!location) return;

    const geoPoint = new GeoPoint(location.lat(), location.lng());
    const address = place.formatted_address || "";

    setPostField("address", address);
    setPostField("routePoints", [
      ...postDraft.routePoints,
      { address, geoPoint },
    ]);
  };

  // ❌ Eliminar punto
  const handleDeletePoint = (index: number) => {
    setPostField(
      "routePoints",
      postDraft.routePoints.filter((_, i) => i !== index)
    );
  };

  if (!isLoaded) return <p>Cargando mapa...</p>;

  return (
    <>
      {/* 📍 Autocomplete sobre el mapa */}
      <div className="relative rounded-lg overflow-hidden shadow-md">
        <Autocomplete
          onLoad={(ref) => (autocompleteRef.current = ref)}
          onPlaceChanged={handlePlaceChanged}
        >
          <div className="absolute top-4 left-3 w-[95%] z-10">
            <ForgeInput
              ref={inputRef}
              name="address"
              placeholder="Busca una ubicación..."
              value={postDraft.address}
              onChange={(e) => setPostField("address", e.target.value)}
            />
          </div>
        </Autocomplete>

        {/* 🗺️ Mapa con markers */}
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={
            postDraft.routePoints.length > 0
              ? geoPointToLatLng(postDraft.routePoints[0].geoPoint)
              : defaultCenter
          }
          zoom={postDraft.routePoints.length ? 8 : 5}
          onLoad={(map: google.maps.Map) => {
            mapRef.current = map;
          }}
          options={{
            disableDefaultUI: true,
            gestureHandling: "none",
            clickableIcons: false,
          }}
        >
          {postDraft.routePoints.map(({ geoPoint }, index) => (
            <Marker
              key={index}
              position={geoPointToLatLng(geoPoint)}
              onRightClick={() => handleDeletePoint(index)}
            />
          ))}
        </GoogleMap>
      </div>

      {/* 📋 Lista de ubicaciones seleccionadas */}
      <div className="mt-4 px-2 space-y-2">
        {postDraft.routePoints.map(({ address }, index) => (
          <div
            key={index}
            className="flex justify-between items-center bg-base-100 p-2 rounded shadow-sm"
          >
            <span className="text-sm truncate max-w-[80%]">{address}</span>
            <button
              onClick={() => handleDeletePoint(index)}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default ForgeMap;