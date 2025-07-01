import { db } from "@/config/firebaseConfig";
import { addDoc, collection, doc, getDocs, getDoc, setDoc, query, where, deleteDoc, updateDoc, increment, arrayUnion, arrayRemove, runTransaction, orderBy } from "firebase/firestore";
import { Post, Route, User } from "@/types";
import { deleteImagesFromSupabase } from "@/services/supabase-storage-service.ts";
import { Comment } from "@/types/comment";
import { Timestamp } from "firebase/firestore";

// Interfaces para los tipos
interface PostView {
  postId: string;
  userId: string;
  viewedAt: string;
  userType: 'visitor' | 'authenticated';
  docId?: string;
}

interface GeoPoint {
  latitude: number;
  longitude: number;
}

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
    views: 0,
  });

  return docRef.id;
};

/**
 * Obtiene el número actual de vistas de un post
 * @param postId - ID del post
 * @returns Promise con el número de vistas
 */
export const getPostViews = async (postId: string): Promise<number> => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
      const data = postSnap.data();
      return data.views || 0;
    }

    return 0;
  } catch (error) {
    console.error('Error en getPostViews:', error);
    return 0;
  }
};

/**
 * Incrementa el contador de vistas de un post solo si el usuario no lo ha visto antes
 * @param postId - ID del post
 * @param userId - ID del usuario o visitante único
 * @returns Promise con el resultado de la operación
 */
export const incrementPostViewsUnique = async (
  postId: string, 
  userId: string
): Promise<{ views: number; incremented: boolean }> => {
  try {
    console.log('👀 incrementPostViewsUnique llamada:', { 
      postId, 
      userId: userId.substring(0, 12) + '...' 
    });
    
    const postRef = doc(db, 'posts', postId);
    const viewDocId = `${postId}_${userId}`;
    const postViewRef = doc(db, 'post_views', viewDocId);
    
    // Use a transaction to ensure atomicity
    return await runTransaction(db, async (transaction) => {
      // Check if view exists
      const viewDoc = await transaction.get(postViewRef);
      
      if (viewDoc.exists()) {
        console.log('👀 Usuario ya ha visto este post anteriormente');
        const postDoc = await transaction.get(postRef);
        const currentViews = postDoc.exists() ? (postDoc.data().views || 0) : 0;
        return { views: currentViews, incremented: false };
      }
      
      // Get current post data
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists()) {
        throw new Error('Post no encontrado');
      }
      
      const currentViews = postDoc.data().views || 0;
      
      // Register the new view
      transaction.set(postViewRef, {
        postId,
        userId,
        viewedAt: new Date().toISOString(),
        userType: userId.startsWith('visitor_') ? 'visitor' : 'authenticated'
      });
      
      // Increment the view counter
      transaction.update(postRef, {
        views: currentViews + 1
      });
      
      console.log('✅ Nueva vista única registrada, total:', currentViews + 1);
      return { views: currentViews + 1, incremented: true };
    });
    
  } catch (error) {
    console.error('❌ Error en incrementPostViewsUnique:', error);
    throw error;
  }
};

/**
 * Guardar una ruta
 */
export const saveRoute = async (userId: string, postId: string): Promise<boolean> => {
  try {
    console.log('Guardando ruta en Firestore:', { userId, postId }); // Debug
    const savedRouteRef = doc(db, 'saved_routes', `${userId}_${postId}`);
    await setDoc(savedRouteRef, {
      userId,
      postId,
      savedAt: new Date().toISOString(),
    });
    console.log('Ruta guardada exitosamente'); // Debug
    return true;
  } catch (error) {
    console.error('Error al guardar la ruta:', error);
    throw error;
  }
};

/**
 * Verifica si un usuario específico ha visto un post
 * @param postId - ID del post
 * @param userId - ID del usuario o visitante
 * @returns Promise con boolean indicando si ya ha visto el post
 */
export const hasUserViewedPost = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const postViewRef = doc(db, 'post_views', `${postId}_${userId}`);
    const viewDoc = await getDoc(postViewRef);
    return viewDoc.exists();
  } catch (error) {
    console.error('Error en hasUserViewedPost:', error);
    return false;
  }
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
      views: data.views || 0,
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
    email: data.email,
    username: data.username,
    role: data.role,
    savedPosts: data.savedPosts,
    profilePicture: data.profilePicture,
  };
};

/**
 * Obtiene estadísticas detalladas de las vistas de un post
 * @param postId - ID del post
 * @returns Promise con estadísticas de las vistas
 */
export const getPostViewStats = async (postId: string) => {
  try {
    const viewsQuery = query(
      collection(db, 'post_views'),
      where('postId', '==', postId)
    );
    
    const querySnapshot = await getDocs(viewsQuery);
    
    const views = querySnapshot.docs.map(doc => ({
      userId: doc.data().userId,
      viewedAt: doc.data().viewedAt,
      userType: doc.data().userType
    }));
    
    const authenticatedViews = views.filter(v => v.userType === 'authenticated').length;
    const visitorViews = views.filter(v => v.userType === 'visitor').length;
    
    return {
      totalViews: views.length,
      authenticatedViews,
      visitorViews,
      views: views.sort((a, b) => 
        new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
      )
    };
  } catch (error) {
    console.error('Error en getPostViewStats:', error);
    return {
      totalViews: 0,
      authenticatedViews: 0,
      visitorViews: 0,
      views: []
    };
  }
};

/**
 * Limpia vistas duplicadas (función de mantenimiento)
 * @param postId - ID del post (opcional, si no se proporciona limpia todos)
 */
export const cleanupDuplicateViews = async (postId?: string): Promise<void> => {
  try {
    console.log('🧹 Iniciando limpieza de vistas duplicadas...');
    
    let viewsQuery;
    if (postId) {
      viewsQuery = query(
        collection(db, 'post_views'),
        where('postId', '==', postId)
      );
    } else {
      viewsQuery = collection(db, 'post_views');
    }
    
    const querySnapshot = await getDocs(viewsQuery);
    const viewsByUserAndPost = new Map<string, PostView>();
    const duplicatesToDelete: string[] = [];
    
    // Identificar duplicados
    querySnapshot.docs.forEach(doc => {
      const data = doc.data() as PostView;
      const key = `${data.postId}_${data.userId}`;
      
      if (viewsByUserAndPost.has(key)) {
        // Es un duplicado, marcar para eliminación
        duplicatesToDelete.push(doc.id);
      } else {
        // Primera ocurrencia, guardar
        viewsByUserAndPost.set(key, {
          ...data,
          docId: doc.id
        });
      }
    });
    
    // Eliminar duplicados
    const deletePromises = duplicatesToDelete.map(docId => 
      deleteDoc(doc(db, 'post_views', docId))
    );
    
    await Promise.all(deletePromises);
    
    console.log(`🧹 Limpieza completada. Eliminados ${duplicatesToDelete.length} duplicados.`);
    
  } catch (error) {
    console.error('Error en cleanupDuplicateViews:', error);
    throw error;
  }
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
    const routeQuery = query(collection(db, "routes"), where("postId", "==", postId));
    const routeSnapshot = await getDocs(routeQuery);

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

    // 1.1 Eliminar imágenes de los waypoints (si existen)
    for (const routeDoc of routeSnapshot.docs) {
      const routeData = routeDoc.data() as Route;

      for (const waypoint of routeData.waypoints || []) {
        if (waypoint.images && Array.isArray(waypoint.images)) {
          const waypointImagePaths = extractSupabasePaths(waypoint.images);
          if (waypointImagePaths.length) {
            console.log("🧼 Eliminando imágenes de parada:", waypointImagePaths);
            await deleteImagesFromSupabase(waypointImagePaths);
          }
        }
      }
    }

    // 1. Eliminar el post
    await deleteDoc(postRef);

    // 2. Eliminar ruta asociada
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

export const updatePost = async (postId: string, updateData: Partial<{
  title: string;
  description: string;
  images: string[];
  locationName: string;
}>): Promise<void> => {
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, updateData);
};

/**
 * Actualiza una ruta existente en Firestore
 */
export const updateRoute = async (routeId: string, updateData: Partial<{
  waypoints: Array<{
    geoPoint: GeoPoint;
    address: string;
    description: string;
    images: string[];
  }>;
}>): Promise<void> => {
  const routeRef = doc(db, "routes", routeId);
  await updateDoc(routeRef, updateData);
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

// Dar like a un post
export const likePost = async (postId: string, userId: string): Promise<void> => {
  try {
    console.log('🔥 likePost llamada:', { postId, userId });
    const postRef = doc(db, 'posts', postId);
    
    await updateDoc(postRef, {
      likes: increment(1),
      likedBy: arrayUnion(userId)
    });
    
    console.log('✅ likePost exitoso');
  } catch (error) {
    console.error('❌ Error in likePost:', error);
    throw error;
  }
};

// Quitar like de un post
export const unlikePost = async (postId: string, userId: string): Promise<void> => {
  try {
    console.log('🔥 unlikePost llamada:', { postId, userId });
    const postRef = doc(db, 'posts', postId);
    
    await updateDoc(postRef, {
      likes: increment(-1),
      likedBy: arrayRemove(userId)
    });
    
    console.log('✅ unlikePost exitoso');
  } catch (error) {
    console.error('❌ Error in unlikePost:', error);
    throw error;
  }
};

// Obtener el número de likes de un post
export const getPostLikes = async (postId: string): Promise<number> => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    
    if (postSnap.exists()) {
      const data = postSnap.data();
      return data.likes || 0;
    }
    
    return 0;
  } catch (error) {
    console.error('Error in getPostLikes:', error);
    return 0;
  }
};

// Verificar si un usuario ya le dio like a un post
export const hasUserLikedPost = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    
    if (postSnap.exists()) {
      const data = postSnap.data();
      const likedBy = data.likedBy || [];
      return likedBy.includes(userId);
    }
    
    return false;
  } catch (error) {
    console.error('Error in hasUserLikedPost:', error);
    return false;
  }
};

/**
 * Quitar una ruta guardada
 */
export const unsaveRoute = async (userId: string, postId: string): Promise<boolean> => {
  try {
    console.log('Quitando ruta guardada de Firestore:', { userId, postId }); // Debug
    const savedRouteRef = doc(db, 'saved_routes', `${userId}_${postId}`);
    await deleteDoc(savedRouteRef);
    console.log('Ruta eliminada de guardados exitosamente'); // Debug
    return true;
  } catch (error) {
    console.error('Error al quitar la ruta guardada:', error);
    throw error;
  }
};

/**
 * Verificar si una ruta está guardada
 */
export const isRouteSaved = async (userId: string, postId: string): Promise<boolean> => {
  try {
    console.log('Verificando si ruta está guardada:', { userId, postId }); // Debug
    const savedRouteRef = doc(db, 'saved_routes', `${userId}_${postId}`);
    const docSnap = await getDoc(savedRouteRef);
    const exists = docSnap.exists();
    console.log('Resultado verificación:', exists); // Debug
    return exists;
  } catch (error) {
    console.error('Error al verificar si la ruta está guardada:', error);
    return false;
  }
};

/**
 * Obtener todas las rutas guardadas por un usuario
 */
export const getSavedRoutesByUserId = async (userId: string): Promise<Post[]> => {
  try {
    console.log('Buscando rutas guardadas para usuario:', userId); // Debug
    
    const savedRoutesQuery = query(
      collection(db, 'saved_routes'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(savedRoutesQuery);
    console.log('Documentos de rutas guardadas encontrados:', querySnapshot.docs.length); // Debug
    
    if (querySnapshot.empty) {
      console.log('No hay rutas guardadas para este usuario');
      return [];
    }
    
    const savedRouteIds = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Documento de ruta guardada:', data); // Debug
      return data.postId;
    });
    
    console.log('IDs de posts guardados:', savedRouteIds); // Debug
    
    // Obtener los posts completos de las rutas guardadas
    const savedPosts = await Promise.allSettled(
      savedRouteIds.map(async (postId) => {
        try {
          console.log('Obteniendo post:', postId); // Debug
          const post = await getPostById(postId);
          console.log('Post obtenido exitosamente:', post.title); // Debug
          return post;
        } catch (error) {
          console.error(`Error al obtener post ${postId}:`, error);
          return null;
        }
      })
    );
    
    // Filtrar solo los posts que se obtuvieron exitosamente
    const validPosts = savedPosts
      .filter((result): result is PromiseFulfilledResult<Post> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
    
    console.log('Posts válidos obtenidos:', validPosts.length); // Debug
    console.log('Títulos de posts obtenidos:', validPosts.map(p => p.title)); // Debug
    
    return validPosts;
    
  } catch (error) {
    console.error('Error al obtener rutas guardadas:', error);
    return [];
  }
};

// Obtener comentarios de un post
export const getCommentsByPostId = async (postId: string): Promise<Comment[]> => {
  const q = query(
    collection(db, "comments"),
    where("postId", "==", postId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
};

// Añadir comentario a un post
export const addCommentToPost = async (
  postId: string,
  userId: string,
  text: string,
  name: string,
  image: string
) => {
  await addDoc(collection(db, "comments"), {
    postId,
    userId,
    text,
    name,
    image,
    createdAt: Timestamp.now(),
  });
};

// Eliminar comentario por id
export const deleteCommentById = async (commentId: string): Promise<void> => {
  await deleteDoc(doc(db, "comments", commentId));
};

