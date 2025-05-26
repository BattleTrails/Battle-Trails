// Importación de componentes de Google Maps y hooks
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  OverlayView
} from "@react-google-maps/api";

// Hooks de React
import {useCallback, useEffect, useRef, useState} from "react";

// Tipado de coordenadas GeoPoint desde Firestore
import {GeoPoint} from "firebase/firestore";

// Store global para estado del post
import {usePostStore} from "@/store/usePostStore";

// Input reutilizable para direcciones
import ForgeInput from "@pages/forge/forge-input/forge-input.tsx";

// Debounce para controlar llamadas al Autocomplete
import debounce from "lodash.debounce";

// Icono para eliminar puntos
import {X} from "lucide-react";

// Icono personalizado de marcador
import MarkerSVG from "@assets/marker.svg";

// Configuración del mapa
const containerStyle = {width: "100%", height: "250px"};
const libraries: ("places")[] = ["places"];

// Tipos para las predicciones del autocomplete
interface Prediction {
  placeId: string;
  mainText: string;
}

interface AutocompleteSuggestion {
  placePrediction: {
    placeId: string;
    structuredFormat?: {
      mainText?: { text: string };
    };
    text?: { text: string };
  };
}

const ForgeMap = () => {
  const mapRef = useRef<google.maps.Map | null>(null); // Referencia al mapa
  const [predictions, setPredictions] = useState<Prediction[]>([]); // Lista de predicciones del autocomplete
  const [showSuggestions, setShowSuggestions] = useState(false); // Mostrar lista de sugerencias
  const [isSelecting, setIsSelecting] = useState(false); // Flag para evitar conflictos al seleccionar
  const {postDraft, setPostField} = usePostStore(); // Estado del post (Zustand)
  const [activeMarkerIndex, setActiveMarkerIndex] = useState<number | null>(null); // Índice del marker activo (con overlay)
  const [, setShouldAutoCenter] = useState(true);

  // Carga del script de Google Maps
  const {isLoaded} = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Conversión de GeoPoint a LatLng
  const geoPointToLatLng = (geo: GeoPoint) => ({
    lat: geo.latitude,
    lng: geo.longitude,
  });

  // Recalcular los límites del mapa cada vez que cambian los puntos
  useEffect(() => {
    if (!mapRef.current || postDraft.routePoints.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    postDraft.routePoints.forEach(({geoPoint}) => {
      bounds.extend(geoPointToLatLng(geoPoint));
    });

    /*mapRef.current.fitBounds(bounds, 100);*/ // Centra el mapa con padding

    // Asegura un zoom mínimo
    const listener = mapRef.current.addListener("bounds_changed", () => {
      const zoom = mapRef.current!.getZoom();
      if (zoom && zoom < 7) mapRef.current!.setZoom(10);
      google.maps.event.removeListener(listener);
    });
  }, [postDraft.routePoints]);

  // Petición debounced al backend de autocomplete
  const fetchPredictions = useCallback(
    debounce(async (input: string) => {
      if (!input.trim()) return;
      try {
        const res = await fetch(import.meta.env.VITE_AUTOCOMPLETE_ENDPOINT, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({input}),
        });

        const data = await res.json();

        const places = (data?.suggestions as AutocompleteSuggestion[])?.map(
          (s) => ({
            placeId: s.placePrediction.placeId,
            mainText:
              s.placePrediction.structuredFormat?.mainText?.text ??
              s.placePrediction.text?.text ??
              "",
          })
        ) ?? [];

        setPredictions(places);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Error obteniendo predicciones:", err);
      }
    }, 500),
    []
  );

  // Limpia el debounce al desmontar
  useEffect(() => {
    return () => {
      fetchPredictions.cancel();
    };
  }, [fetchPredictions]);

  // Manejo del input del usuario
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setPostField("address", value);

    if (isSelecting) return;

    if (!value.trim()) {
      setPredictions([]);
      setShowSuggestions(false);
      return;
    }

    setShowSuggestions(true);
    fetchPredictions(value);
  };

  // Cuando el usuario selecciona una predicción
  const handleSelectSuggestion = async (prediction: Prediction) => {
    setIsSelecting(true);
    setShouldAutoCenter(true); // permitimos centrar

    const res = await fetch(
      `https://places.googleapis.com/v1/places/${prediction.placeId}?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&languageCode=es&regionCode=ES`,
      {
        method: "GET",
        headers: {
          "X-Goog-FieldMask": "id,formattedAddress,location",
        },
      }
    );

    const place = await res.json();

    if (!place?.location) {
      setIsSelecting(false);
      return;
    }

    const address = prediction.mainText;
    const geoPoint = new GeoPoint(place.location.latitude, place.location.longitude);

    // Si ya hay puntos, centra el mapa en el último punto añadido
    const latLng = geoPointToLatLng(geoPoint);
    mapRef.current?.panTo(latLng);


    // Añade el nuevo punto
    setPostField("routePoints", [
      ...postDraft.routePoints,
      {address, geoPoint},
    ]);

    // Vacía el input después de añadir el punto
    setPostField("address", "");

    setShowSuggestions(false);
    setPredictions([]);

    setTimeout(() => setIsSelecting(false), 50); // Espera para evitar conflictos de estado
  };

  // Eliminar un punto concreto
  const handleDeletePoint = (index: number) => {
    setShouldAutoCenter(false); // evitamos recentrado
    setPostField(
      "routePoints",
      postDraft.routePoints.filter((_, i) => i !== index)
    );
  };

  // Placeholder dinámico según si hay puntos añadidos
  const placeholderText =
    postDraft.routePoints.length > 0
      ? "Busca tu siguiente parada..."
      : "Busca la primera ubicación...";

  if (!isLoaded) return <p>Cargando mapa...</p>;

  return (
    <>
      <div className="relative rounded-lg overflow-hidden">
        {/* Input + sugerencias sobre el mapa */}
        <div className="flex flex-col top-3 absolute items-center justify-center w-full z-10">
          <ForgeInput
            name="address"
            placeholder={placeholderText}
            value={postDraft.address}
            onChange={handleChange}
            className="w-[95%]"
          />
          {showSuggestions && predictions.length > 0 && (
            <ul
              className="w-[90%] z-20 mt-1 rounded-md border border-gray-200 bg-white shadow-md max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-accent/50 scrollbar-track-transparent">
              {predictions.map((p) => (
                <li
                  key={p.placeId}
                  className="px-4 py-2 cursor-pointer hover:bg-accent"
                  onMouseDown={() => handleSelectSuggestion(p)}
                >
                  {p.mainText}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mapa con markers y overlays */}
        <GoogleMap
          mapContainerStyle={containerStyle}

          zoom={postDraft.routePoints.length ? 8 : 5}
          onLoad={(map: google.maps.Map) => {
            mapRef.current = map;
          }}
          options={{
            disableDefaultUI: true,
            clickableIcons: false,
          }}
        >
          {postDraft.routePoints.map((point, index) => {
            const position = geoPointToLatLng(point.geoPoint);

            return (
              <>
                {/* Marcador personalizado */}
                <Marker
                  position={position}
                  icon={{
                    url: MarkerSVG,
                    scaledSize: new window.google.maps.Size(32, 32),
                  }}
                  onClick={() => {
                    setActiveMarkerIndex((prev) => (prev === index ? null : index));
                    mapRef.current?.panTo(position); // centra en ese punto
                  }}
                />

                {/* Overlay tipo badge con botón de eliminar */}
                {activeMarkerIndex === index && (
                  <OverlayView
                    position={position}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <div
                      className="relative left-1/2 -translate-x-1/2 -translate-y-17 bg-white w-max px-3 py-1 rounded-full shadow-md flex items-center gap-2">
                      <p className="text-sm font-medium max-w-[160px] truncate">
                        {point.address}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          handleDeletePoint(index);
                          setActiveMarkerIndex(null);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        <X/>
                      </button>
                    </div>
                  </OverlayView>
                )}
              </>
            );
          })}
        </GoogleMap>
      </div>
    </>
  );
};

export default ForgeMap;
