import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { supabase } from '@/config/supabaseClient';
import { compressImages } from '@/utils/compress-images';

// Función para refrescar el contexto de autenticación después de actualizar el perfil
const refreshAuthContext = async () => {
  try {
    // Forzar una actualización del contexto emitiendo un evento personalizado
    window.dispatchEvent(new CustomEvent('profileUpdated'));
  } catch (error) {
    console.warn('Error al refrescar contexto:', error);
  }
};

interface UpdateUserData {
  name?: string;
  username?: string;
  bio?: string;
  profilePicture?: File;
}

// Función auxiliar para eliminar la imagen anterior del almacenamiento
const deleteOldProfileImage = async (imageUrl: string) => {
  try {
    // Solo eliminar imágenes que estén en Supabase Storage (no avatares por defecto)
    if (!imageUrl || !imageUrl.includes('supabase.co/storage')) {
      return;
    }

    // Extraer el path del archivo de la URL de Supabase
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const storageIndex = pathParts.findIndex(part => part === 'storage');

    if (storageIndex === -1) {
      return;
    }

    // El path correcto después de /storage/v1/object/public/profiles/ es el que necesitamos
    const objectPath = pathParts.slice(storageIndex + 5).join('/');

    const { error } = await supabase.storage.from('profiles').remove([objectPath]);

    if (error) {
      console.warn('Error al eliminar imagen anterior:', error);
    }
  } catch (error) {
    console.warn('Error procesando eliminación de imagen anterior:', error);
  }
};

export const updateUserProfile = async (userId: string, data: UpdateUserData) => {
  try {
    const updateData: Record<string, string | undefined> = {};

    // Actualizar campos básicos
    if (data.name) updateData.name = data.name;
    if (data.username) updateData.username = data.username;
    if (data.bio) updateData.bio = data.bio;

    // Obtener la imagen anterior ANTES de hacer cualquier cambio
    let oldProfilePictureUrl: string | null = null;
    if (data.profilePicture) {
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          oldProfilePictureUrl = userDoc.data().profilePicture || null;
        }
      } catch (error) {
        console.warn('No se pudo obtener la imagen anterior:', error);
      }
    }

    // Si hay una nueva foto de perfil, subirla a Supabase
    if (data.profilePicture) {
      const compressedImages = await compressImages([data.profilePicture]);

      if (compressedImages.length === 0) {
        throw new Error('Error al procesar la imagen de perfil');
      }

      const compressedImage = compressedImages[0];
      const filePath = `${userId}/profile/${Date.now()}-${compressedImage.name}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, compressedImage);

      if (uploadError) {
        console.error('❌ Error al subir imagen:', uploadError);
        throw new Error(`Error al subir imagen: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage.from('profiles').getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Error al obtener la URL pública de la imagen');
      }

      updateData.profilePicture = urlData.publicUrl;
    }

    // Actualizar documento en Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updateData);

    // Si se subió una nueva imagen, eliminar la anterior después de actualizar exitosamente
    if (data.profilePicture && updateData.profilePicture && oldProfilePictureUrl) {
      try {
        if (oldProfilePictureUrl !== updateData.profilePicture) {
          await deleteOldProfileImage(oldProfilePictureUrl);
        }
      } catch (deleteError) {
        console.warn('No se pudo eliminar la imagen anterior:', deleteError);
        // No lanzar error aquí, ya que la actualización fue exitosa
      }
    }

    // Refrescar el contexto de autenticación para actualizar la UI
    await refreshAuthContext();

    return { success: true };
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    throw error;
  }
};

export const validateUsername = async (username: string): Promise<boolean> => {
  try {
    // Verificar longitud y caracteres permitidos
    if (username.length < 3 || username.length > 20) return false;
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return false;

    // Verificar unicidad del username en la base de datos
    // Nota: Esta implementación requiere acceso a la base de datos
    // Por ahora, asumimos que el username es válido si pasa las validaciones básicas
    // En una implementación completa, se haría una consulta para verificar unicidad
    return true;
  } catch (error) {
    console.error('Error al validar username:', error);
    return false;
  }
};
