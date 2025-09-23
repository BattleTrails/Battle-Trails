import { GeoPoint } from "firebase/firestore";

export interface RoutingLegSummary {
	distanceMeters: number;
	durationSeconds: number;
}

export interface RoutingResult {
	coordinates: [number, number][]; // [lat, lon]
	total: RoutingLegSummary;
	legs: RoutingLegSummary[];
}

// Simple cliente para OSRM público. Para producción, considera un backend propio para evitar límites.
const OSRM_BASE_URL = "https://router.project-osrm.org";
import fetchWithTimeout from "@/utils/fetchWithTimeout";

// Cache en memoria simple para respuestas de rutas
// Clave: string estable derivada de waypoints
const routeResponseCache = new Map<string, RoutingResult>();

export const __clearRoutingCache = (): void => {
    routeResponseCache.clear();
};

const buildCoordinatesParam = (waypoints: GeoPoint[]): string => {
	// OSRM espera lon,lat separados por ';'
	return waypoints
		.map((wp) => `${wp.longitude},${wp.latitude}`)
		.join(";");
};

export const fetchDrivingRoute = async (waypoints: GeoPoint[]): Promise<RoutingResult> => {
	if (waypoints.length < 2) {
		throw new Error("Se necesitan al menos 2 puntos para calcular la ruta de conducción.");
	}

    const coords = buildCoordinatesParam(waypoints);
    const cacheKey = coords; // suficiente porque el orden importa

    // Intentar cache primero
    const cached = routeResponseCache.get(cacheKey);
    if (cached) {
        return cached;
    }
	const url = `${OSRM_BASE_URL}/route/v1/driving/${coords}?overview=full&geometries=geojson&annotations=duration,distance&steps=false`;

    // Aplicar timeout de 10s para evitar bloqueos prolongados
    const resp = await fetchWithTimeout(url, 10000);
	if (!resp.ok) {
		throw new Error(`Error de routing OSRM: ${resp.status} ${resp.statusText}`);
	}
	const data = await resp.json();

	if (!data || data.code !== "Ok" || !data.routes || data.routes.length === 0) {
		throw new Error("Respuesta de routing inválida o sin rutas.");
	}

	const route = data.routes[0];
	const geometry = route.geometry; // GeoJSON LineString
	const legs = route.legs as Array<{ distance: number; duration: number }>; // metros / segundos

	const totalDistance = legs.reduce((acc, l) => acc + (l.distance || 0), 0); // metros
	const totalDuration = legs.reduce((acc, l) => acc + (l.duration || 0), 0); // segundos

	const coordinates: [number, number][] = (geometry?.coordinates || []).map(
		(c: [number, number]) => [c[1], c[0]] // [lat, lon]
	);

    const result: RoutingResult = {
		coordinates,
		total: {
			distanceMeters: totalDistance,
			durationSeconds: totalDuration,
		},
		legs: legs.map((l) => ({
			distanceMeters: l.distance || 0,
			durationSeconds: l.duration || 0,
		})),
    };

    // Guardar en cache
    routeResponseCache.set(cacheKey, result);

    return result;
};


