import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { GeoPoint } from "firebase/firestore";
import { usePostStore } from "@/store/usePostStore";
import ForgeInput from "@pages/forge/forge-input/forge-input.tsx";
import clsx from "clsx";
import debounce from "lodash.debounce";
import { X } from "lucide-react";
import MarkerSVG from "@assets/marker.svg";

const containerStyle = { width: "100%", height: "250px" };
const defaultCenter = { lat: 40.4168, lng: -3.7038 };
const libraries: ("places")[] = ["places"];

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
  const { postDraft, setPostField } = usePostStore();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const geoPointToLatLng = (geo: GeoPoint) => ({
    lat: geo.latitude,
    lng: geo.longitude,
  });

  useEffect(() => {
    if (!mapRef.current || postDraft.routePoints.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    postDraft.routePoints.forEach(({ geoPoint }) => {
      bounds.extend(geoPointToLatLng(geoPoint));
    });

    mapRef.current.fitBounds(bounds, 80);

    const listener = mapRef.current.addListener("bounds_changed", () => {
      const zoom = mapRef.current!.getZoom();
      if (zoom && zoom < 7) mapRef.current!.setZoom(7);
      google.maps.event.removeListener(listener);
    });
  }, [postDraft.routePoints]);

  const fetchPredictions = useCallback(
    debounce(async (input: string) => {
      if (!input.trim()) return;
      try {
        const res = await fetch(import.meta.env.VITE_AUTOCOMPLETE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input }),
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

  useEffect(() => {
    return () => {
      fetchPredictions.cancel();
    };
  }, [fetchPredictions]);

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

  const handleSelectSuggestion = async (prediction: Prediction) => {
    setIsSelecting(true);

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
    const geoPoint = new GeoPoint(
      place.location.latitude,
      place.location.longitude
    );

    setPostField("address", address);
    setPostField("routePoints", [
      ...postDraft.routePoints,
      { address, geoPoint },
    ]);
    setShowSuggestions(false);
    setPredictions([]);

    setTimeout(() => setIsSelecting(false), 50);
  };

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
        <div className="absolute top-4 left-3 w-[95%] z-10">
          <ForgeInput
            name="address"
            placeholder="Busca una ubicación..."
            value={postDraft.address}
            onChange={handleChange}
          />
          {showSuggestions && predictions.length > 0 && (
            <ul className="absolute w-full z-20 mt-1 rounded-md border border-gray-200 bg-white shadow-md max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-accent/50 scrollbar-track-transparent">
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

            clickableIcons: false,
          }}
        >
          {postDraft.routePoints.map(({ geoPoint }, index) => (
            <Marker
              key={index}
              position={geoPointToLatLng(geoPoint)}
              icon={{
                url: MarkerSVG,
                scaledSize: new window.google.maps.Size(32, 32),
              }}
            />
          ))}
        </GoogleMap>
      </div>

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
              <X />
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default ForgeMap;
