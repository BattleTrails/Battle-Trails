import {create} from "zustand";
import {GeoPoint} from "firebase/firestore";

type PostDraft = {
  title: string;
  description: string;
  images: File[];
  location?: GeoPoint;
  distance?: string;
};

type PostStore = {
  postDraft: PostDraft;
  setPostField: <K extends keyof PostDraft>(field: K, value: PostDraft[K]) => void;
  setImages: (files: File[]) => void;
  resetPostDraft: () => void;
};

export const usePostStore = create<PostStore>((set) => ({
  postDraft: {
    title: "",
    description: "",
    images: [],
    location: undefined,
    distance: "0 km"
  },

  setPostField: (field, value) =>
    set((state) => ({
      postDraft: {
        ...state.postDraft,
        [field]: value,
      },
    })),

  setImages: (files) =>
    set((state) => ({
      postDraft: {
        ...state.postDraft,
        images: files,
      },
    })),

  resetPostDraft: () =>
    set(() => ({
      postDraft: {
        title: "",
        description: "",
        images: [],
        location: undefined,
      },
    })),
}));
