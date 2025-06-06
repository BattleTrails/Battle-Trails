import {db} from "@/config/firebaseConfig";
import {addDoc, collection, doc, getDocs,getDoc, setDoc,query,where} from "firebase/firestore";

import {Post, Route, User} from "@/types";


/**
 * Crea un nuevo post en Firestore y devuelve su ID.
 */
export const createPost = async (postData: {
  userId: string;
  title: string;
  description: string;
  images: string[];
  locationName: string;
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
      locationName: data.locationName,
      routeId: data.routeId,
      likes: data.likes,
      likedBy: data.likedBy,
    };
  });
};

export const getPostById = async (postId: string): Promise<Post> => {
  const docRef = doc(db, "posts", postId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error("Post no encontrado");
  return { id: snap.id, ...snap.data() } as Post;
};

export const getRouteByPostId = async (postId: string) => {
  const q = query(collection(db, "routes"), where("postId", "==", postId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    postId: doc.data().postId,
    waypoints: doc.data().waypoints,
    images: doc.data().images,
  } as Route;

};

export const getPostsByUserId = async (userId: string): Promise<Post[]> => {
  const postsRef = collection(db, "posts");
  const q = query(postsRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Post[];
};


export const getUserById = async (userId: string): Promise<User> => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) throw new Error("Usuario no encontrado");

  const data = userSnap.data();
  return {
    id: userSnap.id,
    name: data.name,
    email:data.email,
    username: data.username,
    profilePicture: data.profilePicture,
  };
};
