

export interface Post {
  id: string;
  userId: string;
  title: string;
  description: string;
  images: string[];
  locationName: string;
  routeId: string;
  /*createdAt: Timestamp ;*/
  likes: number;
  likedBy: string[];
  views: number;
}
