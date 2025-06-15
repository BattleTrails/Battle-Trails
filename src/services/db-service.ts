import {db} from "@/config/firebaseConfig"; 
  import {addDoc, updateDoc, collection, doc, getDocs,getDoc, setDoc,query,where, deleteDoc, increment, arrayUnion, arrayRemove } from "firebase/firestore";


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
    views: 0,
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
    role:data.role,
    savedPosts:data.savedPosts,
    profilePicture: data.profilePicture,
  };
};

// ============== FUNCIONES PARA RUTAS GUARDADAS ==============

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
    
    // Verificar si ya existe una vista de este usuario
    const viewDoc = await getDoc(postViewRef);
    
    if (viewDoc.exists()) {
      console.log('👀 Usuario ya ha visto este post anteriormente');
      
      // Obtener el conteo actual de vistas
      const postDoc = await getDoc(postRef);
      const currentViews = postDoc.exists() ? (postDoc.data().views || 0) : 0;
      
      return { views: currentViews, incremented: false };
    }
    
    // Registrar la nueva vista del usuario
    await setDoc(postViewRef, {
      postId,
      userId,
      viewedAt: new Date().toISOString(),
      userType: userId.startsWith('visitor_') ? 'visitor' : 'authenticated'
    });
    
    // Incrementar el contador de vistas del post
    await updateDoc(postRef, {
      views: increment(1)
    });
    
    // Obtener el documento actualizado para devolver el nuevo conteo
    const updatedPost = await getDoc(postRef);
    if (!updatedPost.exists()) {
      throw new Error('Post no encontrado después del incremento');
    }
    
    const newViews = updatedPost.data().views || 0;
    console.log('✅ Nueva vista única registrada, total:', newViews);
    
    return { views: newViews, incremented: true };
    
  } catch (error) {
    console.error('❌ Error en incrementPostViewsUnique:', error);
    throw error;
  }
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
    const viewsByUserAndPost = new Map<string, any>();
    const duplicatesToDelete: string[] = [];
    
    // Identificar duplicados
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const key = `${data.postId}_${data.userId}`;
      
      if (viewsByUserAndPost.has(key)) {
        // Es un duplicado, marcar para eliminación
        duplicatesToDelete.push(doc.id);
      } else {
        // Primera ocurrencia, guardar
        viewsByUserAndPost.set(key, {
          docId: doc.id,
          ...data
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