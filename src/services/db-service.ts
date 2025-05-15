import { db } from "@/config/firebaseConfig";
import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    setDoc,
} from "firebase/firestore";

import { Post, Route } from "@/types";

/**
 * Crea un nuevo post en Firestore y devuelve su ID.
 */
export const createPost = async (postData: Post): Promise<string> => {
    const docRef = await addDoc(collection(db, "posts"), {
        ...postData,
        likes: 0,
        likedBy: [],
        createdAt: serverTimestamp(),
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
