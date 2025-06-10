import {db} from "@/config/firebaseConfig";
import {addDoc, collection, doc, getDocs,getDoc, setDoc,query,where,deleteDoc} from "firebase/firestore";

import {Post, Route, User} from "@/types";
import {deleteImagesFromSupabase} from "@/services/supabase-storage-service.ts";


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


const extractSupabasePaths = (urls: string[]) => {
  return urls
    .map((url) => {
      try {
        const parsed = new URL(url);
        const match = parsed.pathname.match(/\/storage\/v1\/object\/public\/posts\/(.+)/);
        return match?.[1] || null;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as string[];
};

/**
 * Elimina un post y su ruta asociada por postId.
 */
export const deletePostById = async (postId: string): Promise<void> => {
  try {
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      throw new Error("Post no encontrado");
    }

    const postData = postSnap.data() as Post;

    // 0. Eliminar imágenes de Supabase si existen
    if (postData.images && Array.isArray(postData.images)) {
      const imagePaths = extractSupabasePaths(postData.images);
      console.log("🔍 Imagenes en post:", postData.images);
      console.log("🧼 Paths extraídos:", imagePaths);
      await deleteImagesFromSupabase(imagePaths);
    }

    // 1. Eliminar el post
    await deleteDoc(postRef);

    // 2. Eliminar ruta asociada
    const routeQuery = query(collection(db, "routes"), where("postId", "==", postId));
    const routeSnapshot = await getDocs(routeQuery);

    const deleteRoutePromises = routeSnapshot.docs.map((routeDoc) =>
      deleteDoc(doc(db, "routes", routeDoc.id))
    );

    await Promise.all(deleteRoutePromises);

    // 3. (Futuro) Eliminar comentarios del post
    // const commentsRef = collection(db, "posts", postId, "comments");
    // const commentsSnap = await getDocs(commentsRef);
    // const deleteComments = commentsSnap.docs.map((doc) => deleteDoc(doc.ref));
    // await Promise.all(deleteComments);

    console.log(`✅ Post ${postId} y ruta asociada eliminados correctamente`);
  } catch (error) {
    console.error("❌ Error al eliminar el post y ruta:", error);
    throw error;
  }
};


/*export const deletePostsByUserId = async (userId: string): Promise<void> => {
  try {
    const postsRef = collection(db, "posts");
    const userPostsQuery = query(postsRef, where("userId", "==", userId));
    const snapshot = await getDocs(userPostsQuery);

    if (snapshot.empty) {
      console.log(`ℹ️ No se encontraron publicaciones del usuario ${userId}`);
      return;
    }

    const deletePromises = snapshot.docs.map(async (docSnap) => {
      const postId = docSnap.id;
      const postData = docSnap.data() as Post;

      // 0. Eliminar imágenes si las hay
      if (postData.images && Array.isArray(postData.images)) {
        const imagePaths = extractSupabasePaths(postData.images);
        console.log("🔍 Imagenes en post:", postData.images);
        console.log("🧼 Paths extraídos:", imagePaths);
        await deleteImagesFromSupabase(imagePaths);
      }

      // 1. Eliminar el post
      await deleteDoc(doc(db, "posts", postId));

      // 2. Eliminar ruta asociada
      const routeQuery = query(collection(db, "routes"), where("postId", "==", postId));
      const routeSnap = await getDocs(routeQuery);

      const deleteRoutes = routeSnap.docs.map((routeDoc) =>
        deleteDoc(doc(db, "routes", routeDoc.id))
      );

      await Promise.all(deleteRoutes);

      // 3. (opcional futuro) Eliminar comentarios
    });

    await Promise.all(deletePromises);
    console.log(`✅ Publicaciones y rutas del usuario ${userId} eliminadas correctamente`);
  } catch (error) {
    console.error("❌ Error al eliminar publicaciones del usuario:", error);
    throw error;
  }
};*/

