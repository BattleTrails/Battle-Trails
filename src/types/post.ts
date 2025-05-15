import { Timestamp, GeoPoint } from "firebase/firestore";

export interface Post {
    id: string;
    userId: string;
    title: string;
    description: string;
    images: string[];
    location?: GeoPoint; // opcional hasta que se integre el mapa
    createdAt: Timestamp;
    likes: number;
    likedBy: string[];
}
