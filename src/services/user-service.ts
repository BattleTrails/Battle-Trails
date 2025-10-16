import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { supabase } from "@/config/supabaseClient";
import { compressImages } from "@/utils/compress-images";

interface UpdateUserData {
  name?: string;
  username?: string;
  bio?: string;
  profilePicture?: File;
}

export const updateUserProfile = async (userId: string, data: UpdateUserData) => {
  try {
    const updateData: Record<string, any> = {};
    
    // Actualizar campos básicos
    if (data.name) updateData.name = data.name;
    if (data.username) updateData.username = data.username;
    if (data.bio) updateData.bio = data.bio;

    // Si hay una nueva foto de perfil, subirla a Supabase
    if (data.profilePicture) {
      const [compressedImage] = await compressImages([data.profilePicture]);
      const filePath = `${userId}/profile/${Date.now()}-${compressedImage.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, compressedImage);

      if (uploadError) {
        throw new Error("Error al subir la imagen de perfil");
      }

      const { data: urlData } = supabase.storage
        .from("profiles")
        .getPublicUrl(filePath);

      if (urlData) {
        updateData.profilePicture = urlData.publicUrl;
      }
    }

    // Actualizar documento en Firestore
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updateData);

    return { success: true };
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    throw error;
  }
};

export const validateUsername = async (username: string, currentUserId: string): Promise<boolean> => {
  try {
    // Verificar longitud y caracteres permitidos
    if (username.length < 3 || username.length > 20) return false;
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return false;

    // TODO: Implementar verificación de unicidad del username en la base de datos
    return true;
  } catch (error) {
    console.error("Error al validar username:", error);
    return false;
  }
};
