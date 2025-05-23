// Importa el mapa de Google y el hook para cargar la API JS
import {
  GoogleMap,
  useJsApiLoader,
} from "@react-google-maps/api";
// React hooks
import { useCallback, useEffect, useRef, useState } from "react";
import { GeoPoint } from "firebase/firestore";
import { usePostStore } from "@/store/usePostStore";
import ForgeInput from "@pages/forge/forge-input/forge-input.tsx";

import clsx from "clsx";
import debounce from "lodash.debounce";

// Estilo y configuración del contenedor del mapa
const containerStyle = { width: "100%", height: "200px" };
const defaultCenter = { lat: 40.4168, lng: -3.7038 };

// Necesario para que la API JS cargue `places`
const libraries: ("places")[] = ["places"];

// Interfaz para cada predicción que se muestra al usuario
interface Prediction {
  placeId: string;
  mainText: string;
}

// Interfaz del tipo de respuesta que devuelve el endpoint de autocomplete
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
  // Referencias al input y al mapa
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Estado de predicciones (dropdown)
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion] = useState<number>(-1); // aún no se usa dinámicamente

  // Acceso a Zustand para leer y actualizar el post
  const { postDraft, setPostField } = usePostStore();

  // Carga del script de Google Maps con clave y librerías necesarias
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Utilidad para convertir GeoPoint (Firestore) a lat/lng
  const geoPointToLatLng = (geo: GeoPoint) => ({
    lat: geo.latitude,
    lng: geo.longitude,
  });

  // Cada vez que cambian los puntos de ruta → reajustamos el mapa
  useEffect(() => {
    if (!mapRef.current || postDraft.routePoints.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    postDraft.routePoints.forEach(({ geoPoint }) => {
      bounds.extend(geoPointToLatLng(geoPoint));
    });

    mapRef.current.fitBounds(bounds, 80);

    // Si el zoom queda muy lejos, lo acercamos
    const listener = mapRef.current.addListener("bounds_changed", () => {
      const zoom = mapRef.current!.getZoom();
      if (zoom && zoom < 7) mapRef.current!.setZoom(7);
      google.maps.event.removeListener(listener);
    });
  }, [postDraft.routePoints]);

  // Función de predicción debounced (espera 500ms entre llamadas)
  const fetchPredictions = useCallback(
    debounce(async (input: string) => {
      if (!input.trim()) return;
      try {
        const res = await fetch("http://127.0.0.1:54321/functions/v1/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input }),
        });

        const data = await res.json();

        const places = (data?.suggestions as AutocompleteSuggestion[])?.map((s) => ({
          placeId: s.placePrediction.placeId,
          mainText:
            s.placePrediction.structuredFormat?.mainText?.text ??
            s.placePrediction.text?.text ??
            "",
        })) ?? [];

        setPredictions(places);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Error obteniendo predicciones:", err);
      }
    }, 500),
    []
  );

  // Cleanup del debounce al desmontar el componente
  useEffect(() => {
    return () => {
      fetchPredictions.cancel();
    };
  }, [fetchPredictions]);

  // Handler del input del usuario → actualiza Zustand y lanza fetch
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setPostField("address", value);
    setShowSuggestions(true);
    fetchPredictions(value);
  };

  // Cuando el usuario selecciona una predicción → obtenemos los detalles del lugar
  const handleSelectSuggestion = async (prediction: Prediction) => {
    const address = prediction.mainText;
    const detailsRes = await fetch(
      `https://places.googleapis.com/v1/places/${prediction.placeId}?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&languageCode=es&regionCode=ES`,
      {
        method: "GET",
        headers: {
          "X-Goog-FieldMask": "id,formattedAddress,location",
        },
      }
    );

    const place = await detailsRes.json();

    if (!place?.location) return;

    const geoPoint = new GeoPoint(place.location.latitude, place.location.longitude);

    setPostField("address", address);
    setPostField("routePoints", [...postDraft.routePoints, { address, geoPoint }]);
    setShowSuggestions(false);
    setPredictions([]);
  };

  // Elimina un punto de ruta del listado y del estado global
  const handleDeletePoint = (index: number) => {
    setPostField(
      "routePoints",
      postDraft.routePoints.filter((_, i) => i !== index)
    );
  };

  // Mientras carga el mapa, renderizamos loading
  if (!isLoaded) return <p>Cargando mapa...</p>;

  return (
    <>
      <div className="relative rounded-lg overflow-hidden shadow-md">
        {/* Input + sugerencias */}
        <div className="absolute top-4 left-3 w-[95%] z-10">
          <ForgeInput
            ref={inputRef}
            name="address"
            placeholder="Busca una ubicación..."
            value={postDraft.address}
            onChange={handleChange}
          />
          {showSuggestions && predictions.length > 0 && (
            <ul className="bg-white shadow-md mt-1 rounded-md max-h-60 overflow-y-auto absolute w-full border border-gray-200 z-20">
              {predictions.map((p, idx) => (
                <li
                  key={p.placeId}
                  className={clsx(
                    "px-4 py-2 cursor-pointer hover:bg-accent",
                    activeSuggestion === idx && "bg-accent"
                  )}
                  onMouseDown={() => handleSelectSuggestion(p)}
                >
                  {p.mainText}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mapa de Google renderizado */}
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

      {/* Lista de puntos añadidos */}
      <div className="mt-4 px-2 space-y-2">
        {postDraft.routePoints.map(({ address }, index) => (
          <div
            key={index}
            className="flex justify-between items-center bg-base-100 p-2 rounded shadow-sm"
          >
            <span className="text-sm truncate max-w-[80%]">{address}</span>
            <button
              type="button"
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
