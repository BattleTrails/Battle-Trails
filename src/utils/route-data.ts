import { GeoPoint } from "firebase/firestore";

export const getFormattedRouteMetaData = async (
  waypoints: GeoPoint[]
): Promise<{ distance: string; duration: string }> => {
  if (waypoints.length < 2) {
    throw new Error("Se necesitan al menos 2 puntos para calcular la ruta.");
  }

  const origin = {
    lat: waypoints[0].latitude,
    lng: waypoints[0].longitude,
  };

  const destination = {
    lat: waypoints.at(-1)!.latitude,
    lng: waypoints.at(-1)!.longitude,
  };

  const middle = waypoints.slice(1, -1).map((point) => ({
    location: { lat: point.latitude, lng: point.longitude },
    stopover: true,
  }));

  const service = new google.maps.DirectionsService();

  return new Promise((resolve, reject) => {
    service.route(
      {
        origin,
        destination,
        waypoints: middle,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (
          status === google.maps.DirectionsStatus.OK &&
          result?.routes?.[0]?.legs
        ) {
          const legs = result.routes[0].legs;
          const totalDistance = legs.reduce(
            (sum, leg) => sum + (leg.distance?.value || 0),
            0
          );
          const totalDuration = legs.reduce(
            (sum, leg) => sum + (leg.duration?.value || 0),
            0
          );

          // 🔁 Formateo
          const distance =
            totalDistance < 1000
              ? `${totalDistance} m`
              : `${(totalDistance / 1000).toFixed(1)} km`;

          const hours = Math.floor(totalDuration / 3600);
          const minutes = Math.round((totalDuration % 3600) / 60);
          const duration =
            hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

          resolve({ distance, duration });
        } else {
          reject(`Error al calcular la ruta: ${status}`);
        }
      }
    );
  });
};
