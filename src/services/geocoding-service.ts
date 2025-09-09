// Servicio de geocodificación usando OpenStreetMap Nominatim
import { GeoPoint } from "firebase/firestore";

// Tipos para las respuestas de Nominatim
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

export interface GeocodingResult {
  placeId: string;
  displayName: string;
  lat: number;
  lng: number;
  address: string;
}

// Configuración de Nominatim
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
const REQUEST_DELAY = 1000; // 1 segundo entre requests para respetar rate limits

// Cache simple para evitar requests repetidos
const cache = new Map<string, GeocodingResult[]>();

// Función para hacer delay entre requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Geocodificación: convertir dirección a coordenadas
export const geocodeAddress = async (address: string): Promise<GeocodingResult[]> => {
  if (!address.trim()) return [];

  // Verificar cache
  const cacheKey = address.toLowerCase().trim();
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  try {
    // Delay para respetar rate limits
    await delay(REQUEST_DELAY);

    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?` +
      new URLSearchParams({
        q: address,
        format: "json",
        limit: "5",
        addressdetails: "1",
        countrycodes: "es", // Limitar a España
        "accept-language": "es"
      }),
      {
        headers: {
          "User-Agent": "Battle-Trails/1.0"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const results: NominatimResult[] = await response.json();
    
    const geocodingResults: GeocodingResult[] = results.map(result => ({
      placeId: result.place_id.toString(),
      displayName: result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: formatAddress(result)
    }));

    // Guardar en cache
    cache.set(cacheKey, geocodingResults);
    
    return geocodingResults;
  } catch (error) {
    console.error("Error en geocodificación:", error);
    return [];
  }
};

// Geocodificación inversa: convertir coordenadas a dirección
export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    // Delay para respetar rate limits
    await delay(REQUEST_DELAY);

    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?` +
      new URLSearchParams({
        lat: lat.toString(),
        lon: lng.toString(),
        format: "json",
        addressdetails: "1",
        "accept-language": "es"
      }),
      {
        headers: {
          "User-Agent": "Battle-Trails/1.0"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: NominatimResult = await response.json();
    return formatAddress(result);
  } catch (error) {
    console.error("Error en geocodificación inversa:", error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

// Formatear dirección de manera legible
const formatAddress = (result: NominatimResult): string => {
  if (!result.address) {
    return result.display_name;
  }

  const { address } = result;
  const parts = [];

  // Priorizar calle y número
  if (address.house_number && address.road) {
    parts.push(`${address.road}, ${address.house_number}`);
  } else if (address.road) {
    parts.push(address.road);
  }

  // Agregar ciudad o municipio
  if (address.city) {
    parts.push(address.city);
  } else if (address.state) {
    parts.push(address.state);
  }

  // Solo agregar país si no es España (para evitar redundancia)
  if (address.country && address.country !== "España") {
    parts.push(address.country);
  }

  // Si no hay partes, usar el display_name completo
  if (parts.length === 0) {
    return result.display_name;
  }

  return parts.join(", ");
};

// Autocomplete para búsquedas
export const searchPlaces = async (query: string): Promise<GeocodingResult[]> => {
  if (!query.trim() || query.length < 3) return [];

  // Verificar cache
  const cacheKey = `search_${query.toLowerCase().trim()}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  try {
    // Delay para respetar rate limits
    await delay(REQUEST_DELAY);

    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?` +
      new URLSearchParams({
        q: query,
        format: "json",
        limit: "8",
        addressdetails: "1",
        countrycodes: "es",
        "accept-language": "es",
        dedupe: "1"
      }),
      {
        headers: {
          "User-Agent": "Battle-Trails/1.0"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const results: NominatimResult[] = await response.json();
    
    const searchResults: GeocodingResult[] = results.map(result => ({
      placeId: result.place_id.toString(),
      displayName: result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: formatAddress(result)
    }));

    // Guardar en cache
    cache.set(cacheKey, searchResults);
    
    return searchResults;
  } catch (error) {
    console.error("Error en búsqueda de lugares:", error);
    return [];
  }
};

// Convertir GeoPoint a coordenadas Leaflet
export const geoPointToLatLng = (geoPoint: GeoPoint) => ({
  lat: geoPoint.latitude,
  lng: geoPoint.longitude
});

// Convertir coordenadas Leaflet a GeoPoint
export const latLngToGeoPoint = (lat: number, lng: number): GeoPoint => {
  return new GeoPoint(lat, lng);
};

// Limpiar cache (útil para testing o cuando se quiera forzar nuevas búsquedas)
export const clearGeocodingCache = () => {
  cache.clear();
};
