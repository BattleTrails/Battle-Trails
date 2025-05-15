import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/config/firebaseConfig";
import { v4 as uuidv4 } from "uuid";

/**
 * Sube imágenes a Firebase Storage en la carpeta del usuario
 * y devuelve un array con sus URLs públicas.
 */
export const uploadImages = async (
    files: File[],
    userId: string
): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
        const imageRef = ref(storage, `posts/${userId}/${uuidv4()}`);
        await uploadBytes(imageRef, file);
        return await getDownloadURL(imageRef);
    });

    return await Promise.all(uploadPromises);
};
