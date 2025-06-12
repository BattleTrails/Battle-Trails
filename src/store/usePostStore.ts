import { create } from "zustand";
import { GeoPoint } from "firebase/firestore";

type PostDraft = {
  title: string;
  description: string;
  images: File[];
  address: string;
  routePoints: {
    geoPoint: GeoPoint;
    address: string;
    description?: string;
  }[];
  distance?: string;
};

type PostStore = {
  postDraft: PostDraft;
  setPostField: <K extends keyof PostDraft>(field: K, value: PostDraft[K]) => void;
  setImages: (files: File[]) => void;
  setWaypointDescription: (index: number, description: string) => void;
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
        )
      }
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