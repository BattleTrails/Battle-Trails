import {db} from "@/config/firebaseConfig";
import {addDoc, collection, doc, getDocs, setDoc,} from "firebase/firestore";

import {Post, Route} from "@/types";


/**
 * Crea un nuevo post en Firestore y devuelve su ID.
 */
export const createPost = async (postData: {
  userId: string;
  title: string;
  description: string;
  images: string[];
  likes: number;
  likedBy: string[]
}): Promise<string> => {
  const docRef = await addDoc(collection(db, "posts"), {
    ...postData,
    likes: 0,
    likedBy: [],
  });

  return docRef.id;
};


/**
 * Crea una ruta vinculada a un post ya existente.
 */
export const createRoute = async (routeData: Route, postId: string): Promise<void> => {
  const routeRef = doc(db, "routes", postId);

  await setDoc(routeRef, {
    ...routeData,
    postId,
  });
};

export const getPosts = async (): Promise<Post[]> => {
  const snapshot = await getDocs(collection(db, "posts"));

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      userId: data.userId,
      title: data.title,
      description: data.description,
      images: data.images,
      routeId: data.routeId,
      likes: data.likes,
      likedBy: data.likedBy,
    };
  });
};