import { supabase } from "@/config/supabaseClient";

/**
 * Sube múltiples imágenes (aunque solo haya una) y devuelve sus URLs públicas
 */
export const uploadImagesToSupabase = async (files: File[], userId: string): Promise<string[]> => {
    const uploads = await Promise.all(
        files.map(async (file) => {
            const filePath = `${userId}/${Date.now()}-${file.name}`;

            const { error } = await supabase.storage
                .from("posts")
                .upload(filePath, file);

            if (error) {
                console.error("❌ Error al subir imagen:", error);
                return null;
            }

            const { data } = supabase.storage.from("posts").getPublicUrl(filePath);
            return data?.publicUrl ?? null;
        })
    );

    return uploads.filter(Boolean) as string[];
};
