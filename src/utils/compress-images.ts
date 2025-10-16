import imageCompression from 'browser-image-compression';

/**
 * Normaliza el nombre del archivo para que sea seguro y compatible con URLs.
 */
const normalizeFileName = (name: string) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // elimina tildes
    .replace(/ñ/g, 'n') // ñ → n
    .replace(/[^a-z0-9.]/g, '-'); // reemplaza cualquier otro caracter por guión
};

/**
 * Comprime y convierte imágenes a formato `.webp`
 */
export const compressImages = async (files: File[]): Promise<File[]> => {
  const compressedFiles: File[] = [];

  for (const file of files) {
    // Validar que el archivo sea una imagen
    if (!file.type.startsWith('image/')) {
      console.warn('Archivo no es una imagen válida:', file.name);
      continue;
    }

    const isWebP = file.type === 'image/webp';

    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      ...(isWebP ? {} : { fileType: 'image/webp' }),
      initialQuality: 0.9,
    };

    try {
      const compressed = await imageCompression(file, options);

      const baseName = file.name.replace(/\.\w+$/, '.webp');
      const cleanName = normalizeFileName(baseName);

      const newFile = new File([compressed], cleanName, {
        type: 'image/webp',
        lastModified: Date.now(),
      });

      compressedFiles.push(newFile);
    } catch (error) {
      console.warn('Error al comprimir imagen:', error);
      // En lugar de devolver el archivo original, intentar crear una versión básica
      try {
        const baseName = file.name.replace(/\.\w+$/, '.webp');
        const cleanName = normalizeFileName(baseName);

        const basicCompressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/webp',
          initialQuality: 0.7,
        });

        const newFile = new File([basicCompressed], cleanName, {
          type: 'image/webp',
          lastModified: Date.now(),
        });

        compressedFiles.push(newFile);
      } catch (fallbackError) {
        console.error('Error incluso en compresión básica:', fallbackError);
        // Si todo falla, devolver el archivo original pero con extensión webp
        const fallbackName = normalizeFileName(file.name.replace(/\.\w+$/, '.webp'));
        const fallbackFile = new File([file], fallbackName, {
          type: file.type,
          lastModified: Date.now(),
        });
        compressedFiles.push(fallbackFile);
      }
    }
  }

  return compressedFiles;
};
