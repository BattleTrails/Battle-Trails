import {GeoPoint} from "firebase/firestore";

export interface Route {
  postId: string;
  waypoints: {
    geoPoint: GeoPoint;
    address: string;
    description?: string; // editable por el usuario
    images?: string[];
  }[];
}

