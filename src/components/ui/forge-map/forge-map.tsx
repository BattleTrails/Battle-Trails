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

// Icono SVG para los marcadores
import { markerIcons } from "@assets/markers";

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
  const mapRef = useRef<google.maps.Map | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const {postDraft, setPostField} = usePostStore();
  const [activeMarkerIndex, setActiveMarkerIndex] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.4168, lng: -3.7038 });

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




  // Límite máximo de paradas
  const MAX_ROUTE_POINTS = 10;

  // Verificar si una ubicación ya existe en la ruta
  const isDuplicateLocation = (newGeoPoint: GeoPoint): boolean => {
    return postDraft.routePoints.some(point => {
      const distance = calculateDistance(
        point.geoPoint.latitude,
        point.geoPoint.longitude,
        newGeoPoint.latitude,
        newGeoPoint.longitude
      );
      return distance < 100; // Menos de 100 metros se considera duplicado
    });
  };

  // Calcular distancia entre dos puntos en metros
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Recalcular los límites del mapa cada vez que cambian los puntos
  useEffect(() => {
    if (!mapRef.current || postDraft.routePoints.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    postDraft.routePoints.forEach(({geoPoint}) => {
      bounds.extend(geoPointToLatLng(geoPoint));
    });

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

    try {
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
        console.error("No se pudo obtener la ubicación del lugar");
        return;
      }

      // Verificar límite máximo de paradas
      if (postDraft.routePoints.length >= MAX_ROUTE_POINTS) {
        alert(`No puedes añadir más de ${MAX_ROUTE_POINTS} paradas en una ruta`);
        setPostField("address", "");
        setShowSuggestions(false);
        setPredictions([]);
        return;
      }

      const geoPoint = new GeoPoint(place.location.latitude, place.location.longitude);

      // Verificar si la ubicación ya existe
      if (isDuplicateLocation(geoPoint)) {
        alert("Esta ubicación ya está añadida a tu ruta");
        setPostField("address", "");
        setShowSuggestions(false);
        setPredictions([]);
        return;
      }

      const address = prediction.mainText;

      // Si ya hay puntos, centra el mapa en el último punto añadido
      const latLng = geoPointToLatLng(geoPoint);
      mapRef.current?.panTo(latLng);
      setMapCenter(latLng);

      // Añade el nuevo punto
      setPostField("routePoints", [
        ...postDraft.routePoints,
        {address, geoPoint},
      ]);

      // Vacía el input después de añadir el punto
      setPostField("address", "");
      setShowSuggestions(false);
      setPredictions([]);

    } catch (error) {
      console.error("Error al obtener detalles del lugar:", error);
    } finally {
      setTimeout(() => setIsSelecting(false), 50);
    }
  };

  // Eliminar un punto concreto
  const handleDeletePoint = (index: number) => {
    const newRoutePoints = postDraft.routePoints.filter((_, i) => i !== index);
    setPostField("routePoints", newRoutePoints);

    // Si eliminamos el punto activo, cerramos el overlay
    if (activeMarkerIndex === index) {
      setActiveMarkerIndex(null);
    } else if (activeMarkerIndex !== null && activeMarkerIndex > index) {
      // Si el punto activo está después del eliminado, ajustamos su índice
      setActiveMarkerIndex(activeMarkerIndex - 1);
    }
  };

  // Placeholder dinámico según si hay puntos añadidos
  const placeholderText = (() => {
    if (postDraft.routePoints.length === 0) {
      return "Busca la primera ubicación...";
    }
    if (postDraft.routePoints.length >= MAX_ROUTE_POINTS) {
      return `Límite alcanzado (${MAX_ROUTE_POINTS} paradas máximo)`;
    }
    return `Busca tu parada ${postDraft.routePoints.length + 1}...`;
  })();

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
            disabled={postDraft.routePoints.length >= MAX_ROUTE_POINTS}
          />
          {showSuggestions && predictions.length > 0 && (
            <ul className="w-[90%] z-20 mt-1 rounded-md border border-gray-200 bg-white shadow-md max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-accent/50 scrollbar-track-transparent">
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
          center={mapCenter}
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
            const markerIcon = markerIcons[index] || markerIcons[markerIcons.length - 1]; // Fallback al último si se pasa del límite

            return (
              <div key={`${point.geoPoint.latitude}-${point.geoPoint.longitude}-${index}`}>
                {/* Marcador personalizado numerado */}
                <Marker
                  position={position}
                  icon={{
                    url: markerIcon,
                    scaledSize: new window.google.maps.Size(40, 40),
                  }}
                  onClick={() => {
                    setActiveMarkerIndex((prev) => (prev === index ? null : index));
                    mapRef.current?.panTo(position);
                    setMapCenter(position);
                  }}
                />

                {/* Overlay tipo badge con botón de eliminar */}
                {activeMarkerIndex === index && (
                  <OverlayView
                    position={position}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <div className="relative left-1/2 -translate-x-1/2 -translate-y-16 bg-white w-max px-3 py-1 rounded-full shadow-md flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-600">{index + 1}</span>
                      <p className="text-sm font-medium max-w-[160px] truncate">
                        {point.address}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          handleDeletePoint(index);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        <X size={16}/>
                      </button>
                    </div>
                  </OverlayView>
                )}
              </div>
            );
          })}
        </GoogleMap>
      </div>
    </>
  );
};

export default ForgeMap;