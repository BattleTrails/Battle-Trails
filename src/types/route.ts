import {GeoPoint} from "firebase/firestore";

export interface Route {
  id: string;
  postId: string;
  waypoints: GeoPoint[];
  images: string[]; // Imágenes de los puntos si no hay de usuarios
}
