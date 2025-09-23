import type { GeoPoint } from "firebase/firestore";

// Construye una URL de Google Maps Directions con múltiples paradas.
// Formato: https://www.google.com/maps/dir/?api=1&origin=lat,lng&destination=lat,lng&waypoints=lat,lng|lat,lng
export const buildGoogleMapsDirectionsUrl = (waypoints: GeoPoint[], mode: "driving" | "walking" | "bicycling" | "transit" = "driving"): string => {
  if (!Array.isArray(waypoints) || waypoints.length < 2) {
    return "https://www.google.com/maps";
  }

  const toStr = (p: GeoPoint): string => `${p.latitude},${p.longitude}`;
  const origin = toStr(waypoints[0]);
  const destination = toStr(waypoints[waypoints.length - 1]);
  const intermediate = waypoints.slice(1, -1);
  const waypointsParam = intermediate.length > 0 ? intermediate.map(toStr).join("|") : undefined;

  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: mode,
  });

  if (waypointsParam) params.set("waypoints", waypointsParam);

  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

export default buildGoogleMapsDirectionsUrl;

