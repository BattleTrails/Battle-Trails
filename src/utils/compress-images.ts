import imageCompression from "browser-image-compression";

/**
 * Comprime y convierte imágenes a formato `.webp`
 */
export const compressImages = async (files: File[]): Promise<File[]> => {
    const compressedFiles: File[] = [];

    for (const file of files) {
        const isWebP = file.type === "image/webp";

        const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1280,
            useWebWorker: true,
            ...(isWebP ? {} : { fileType: "image/webp" }),
            initialQuality: 0.9,
        };


        try {
            const compressed = await imageCompression(file, options);
            // Cambia el nombre del archivo a .webp
            const newFile = new File(
                [compressed],
                file.name.replace(/\.\w+$/, ".webp"),
                {
                    type: "image/webp",
                    lastModified: Date.now(),
                }
            );
            compressedFiles.push(newFile);
            console.log("✅ Compressed:", newFile.name, newFile.type, newFile.size);

        } catch (error) {
            console.warn("Error al comprimir imagen:", error);
            // Si falla la compresión, mete la original
            compressedFiles.push(file);
        }
    }

    return compressedFiles;
};
