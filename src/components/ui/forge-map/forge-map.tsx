// Componente del mapa con buscador y autocompletado para añadir puntos de ruta
import {
  GoogleMap,
  useJsApiLoader,
} from "@react-google-maps/api";
import {useEffect, useMemo, useRef, useState} from "react";
import {GeoPoint} from "firebase/firestore";
import {usePostStore} from "@/store/usePostStore";
import ForgeInput from "@pages/forge/forge-input/forge-input.tsx";
import clsx from "clsx";
import debounce from "lodash.debounce";

// Librerías que carga Google Maps JS API (en este caso, solo "places")
const libraries: ("places")[] = ["places"];
const containerStyle = {width: "100%", height: "200px"};
const defaultCenter = {lat: 40.4168, lng: -3.7038}; // Centro por defecto: Madrid

const ForgeMap = () => {
  // Refs
  const inputRef = useRef<HTMLInputElement | null>(null); // Input controlado para búsqueda
  const mapRef = useRef<google.maps.Map | null>(null); // Ref del mapa
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null); // Servicio de autocompletado
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null); // Servicio para obtener detalles

  // Estado de sugerencias
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [activeSuggestion] = useState<number>(-1); // (no usado dinámicamente aún)
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Store global (Zustand) para el post en edición
  const {postDraft, setPostField} = usePostStore();

  // Hook para cargar Google Maps JS API con la clave y librerías necesarias
  const {isLoaded} = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Convierte GeoPoint de Firestore en objeto lat/lng para el mapa
  const geoPointToLatLng = (geo: GeoPoint) => ({
    lat: geo.latitude,
    lng: geo.longitude,
  });

  // Inicialización de servicios una vez esté cargado el mapa
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;
    serviceRef.current = new google.maps.places.AutocompleteService();
    placesServiceRef.current = new google.maps.places.PlacesService(mapRef.current);
  }, [isLoaded]);

  // Ajuste automático del mapa a los puntos seleccionados
  useEffect(() => {
    if (!mapRef.current || postDraft.routePoints.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    postDraft.routePoints.forEach(({geoPoint}) => {
      bounds.extend(geoPointToLatLng(geoPoint));
    });

    mapRef.current.fitBounds(bounds, 80);

    // Ajuste de zoom si es demasiado amplio
    const listener = mapRef.current.addListener("bounds_changed", () => {
      const zoom = mapRef.current!.getZoom();
      if (zoom && zoom < 7) mapRef.current!.setZoom(5);
      google.maps.event.removeListener(listener);
    });
  }, [postDraft.routePoints]);

  // 🧠 Función de autocompletado con debounce para reducir peticiones
  const fetchPredictions = useMemo(() =>
      debounce((input: string) => {
        if (!input || !serviceRef.current) return;
        serviceRef.current.getPlacePredictions(
          {input, types: ["geocode"], componentRestrictions: {country: "es"}},
          (results) => setPredictions(results || [])
        );
      }, 1000),
    []);

  // 🔄 Limpieza del debounce al desmontar el componente
  useEffect(() => {
    return () => {
      fetchPredictions.cancel();
    };
  }, [fetchPredictions]);

  // 💡 Manejo del input de dirección (se actualiza Zustand + lanza predicciones)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setPostField("address", value);
    setShowSuggestions(true);
    fetchPredictions(value);
  };

  // 🧭 Selección de una sugerencia: se obtienen los detalles y se añade el punto al post
  const handleSelectSuggestion = (prediction: google.maps.places.AutocompletePrediction) => {
    const placeId = prediction.place_id;
    const address = prediction.description;

    if (!placesServiceRef.current || !mapRef.current) return;

    placesServiceRef.current.getDetails(
      {placeId, fields: ["geometry", "formatted_address"]},
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const geoPoint = new GeoPoint(place.geometry.location.lat(), place.geometry.location.lng());

          setPostField("address", address);
          setPostField("routePoints", [
            ...postDraft.routePoints,
            {address, geoPoint},
          ]);
          setShowSuggestions(false);
          setPredictions([]);
        }
      }
    );
  };

  // ❌ Eliminación de un punto de ruta desde el listado inferior
  const handleDeletePoint = (index: number) => {
    setPostField(
      "routePoints",
      postDraft.routePoints.filter((_, i) => i !== index)
    );
  };

  if (!isLoaded) return <p>Cargando mapa...</p>;

  return (
    <>
      <div className="relative rounded-lg overflow-hidden shadow-md">
        {/* 🔍 Input de búsqueda + sugerencias desplegables */}
        <div className="absolute top-4 left-3 w-[95%] z-10">
          <ForgeInput
            ref={inputRef}
            name="address"
            placeholder="Busca una ubicación..."
            value={postDraft.address}
            onChange={handleChange}
          />
          {showSuggestions && predictions.length > 0 && (
            <ul
              className="bg-white shadow-md mt-1 rounded-md max-h-60 overflow-y-auto absolute w-full border border-gray-200 z-20">
              {predictions.map((p, idx) => (
                <li
                  key={p.place_id}
                  className={clsx(
                    "px-4 py-2 cursor-pointer hover:bg-accent",
                    activeSuggestion === idx && "bg-accent"
                  )}
                  onMouseDown={() => handleSelectSuggestion(p)} // Evita que blur cierre el dropdown antes del click
                >
                  {p.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 🗺️ Renderizado del mapa base de Google */}
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
        />
      </div>

      {/* 📋 Listado de puntos añadidos */}
      <div className="mt-4 px-2 space-y-2">
        {postDraft.routePoints.map(({address}, index) => (
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
