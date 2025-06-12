import { create } from "zustand";
import { GeoPoint } from "firebase/firestore";

type Waypoint = {
  geoPoint: GeoPoint;
  address: string;
  description?: string;
  images: File[]; // asegúrate de que no sea opcional
};

type PostDraft = {
  title: string;
  description: string;
  images: File[];
  address: string;
  routePoints: Waypoint[];
  distance?: string;
};

type PostStore = {
  postDraft: PostDraft;
  setPostField: <K extends keyof PostDraft>(field: K, value: PostDraft[K]) => void;
  setImages: (files: File[]) => void;
  setWaypointDescription: (index: number, description: string) => void;
  setWaypointImages: (index: number, images: File[]) => void;
  resetPostDraft: () => void;
};

export const usePostStore = create<PostStore>((set) => ({
  postDraft: {
    title: "",
    description: "",
    address: "",
    images: [],
    routePoints: [],
    distance: "",
  },
  setPostField: (field, value) =>
    set((state) => ({
      postDraft: { ...state.postDraft, [field]: value },
    })),
  setImages: (files) =>
    set((state) => ({
      postDraft: { ...state.postDraft, images: files },
    })),
  setWaypointDescription: (index, description) =>
    set((state) => ({
      postDraft: {
        ...state.postDraft,
        routePoints: state.postDraft.routePoints.map((point, i) =>
          i === index ? { ...point, description } : point
        ),
      },
    })),
  setWaypointImages: (index, images) =>
    set((state) => ({
      postDraft: {
        ...state.postDraft,
        routePoints: state.postDraft.routePoints.map((point, i) =>
          i === index ? { ...point, images } : point
        ),
      },
    })),
  resetPostDraft: () => set(() => ({
    postDraft: {
      title: "",
      description: "",
      images: [],
      address: "",
      routePoints: [],
      distance: "",
    },
  })),
}));
