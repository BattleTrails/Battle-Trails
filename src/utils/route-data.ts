import { GeoPoint } from "firebase/firestore";
// Eliminado: cálculo vía OSRM

// Calcular distancia entre dos puntos en metros usando la fórmula de Haversine
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

// Eliminado: cálculo de duración (no se usa sin OSRM)

export const getFormattedRouteMetaData = async (
  waypoints: GeoPoint[]
): Promise<{ distance: string; duration: string }> => {
  if (waypoints.length < 2) {
    throw new Error("Se necesitan al menos 2 puntos para calcular la ruta.");
  }

  // Distancia por Haversine; duración no disponible (sin OSRM)
  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const distance = calculateDistance(
      waypoints[i].latitude,
      waypoints[i].longitude,
      waypoints[i + 1].latitude,
      waypoints[i + 1].longitude
    );
    totalDistance += distance;
  }
  const hasDrivingDuration = false;

  // Formatear distancia
  const distance = totalDistance < 1000
    ? `${Math.round(totalDistance)} m`
    : `${(totalDistance / 1000).toFixed(1)} km`;

  // Formatear duración (siempre como conducción; si no disponible, mostrar texto)
  const duration = hasDrivingDuration ? "" : "No disponible";

  return { distance, duration };
};