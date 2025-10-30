import { useState, useCallback } from 'react';
import { moderateText, createModerationFlags } from '@/services/moderation-service';

import {
  moderateImage,
  moderateMultipleImages,
  createImageModerationErrors,
  createImageModerationFlags,
} from '@/services/image-moderation-service';
import { ModerationResult, ModerationFlags, ImageModerationError } from '@/types/moderation';

interface ModerationError {
  field: 'title' | 'description' | 'waypoint';
  waypointIndex?: number;
  message: string;
  categories: string[];
}

interface UseContentModerationReturn {
  isValidating: boolean;
  hasInappropriateContent: boolean;
  moderationErrors: ModerationError[];
  moderationFlags: ModerationFlags | null;
  imageErrors: ImageModerationError[];
  validateContent: (
    title: string,
    description: string,
    waypointDescriptions: string[]
  ) => Promise<boolean>;
  validateImages: (images: File[]) => Promise<boolean>;
  clearErrors: () => void;
  getErrorMessage: () => string;
}

export const useContentModeration = (): UseContentModerationReturn => {
  const [isValidating, setIsValidating] = useState(false);
  const [hasInappropriateContent, setHasInappropriateContent] = useState(false);
  const [moderationErrors, setModerationErrors] = useState<ModerationError[]>([]);
  const [moderationFlags, setModerationFlags] = useState<ModerationFlags | null>(null);
  const [imageErrors, setImageErrors] = useState<ImageModerationError[]>([]);

  const clearErrors = useCallback(() => {
    setModerationErrors([]);
    setHasInappropriateContent(false);
    setModerationFlags(null);
    setImageErrors([]);
  }, []);

  const getErrorMessage = useCallback((): string => {
    const textErrors = moderationErrors.map(error => {
      if (error.field === 'waypoint' && error.waypointIndex !== undefined) {
        return `Parada ${error.waypointIndex + 1}: ${error.message}`;
      }
      return `${error.field === 'title' ? 'Título' : 'Descripción'}: ${error.message}`;
    });

    const imageErrorMessages = imageErrors.map(
      error => `Imagen "${error.imageName}": ${error.message}`
    );

    const allErrors = [...textErrors, ...imageErrorMessages];

    if (allErrors.length === 0) return '';

    return `Contenido inapropiado detectado:\n${allErrors.join('\n')}`;
  }, [moderationErrors, imageErrors]);

  const validateContent = useCallback(
    async (
      title: string,
      description: string,
      waypointDescriptions: string[]
    ): Promise<boolean> => {
      setIsValidating(true);
      clearErrors();

      try {
        const errors: ModerationError[] = [];
        const allTexts: string[] = [];
        const textMap: {
          text: string;
          field: 'title' | 'description' | 'waypoint';
          waypointIndex?: number;
        }[] = [];

        // Preparar textos para validación
        if (title.trim()) {
          allTexts.push(title);
          textMap.push({ text: title, field: 'title' });
        }

        if (description.trim()) {
          allTexts.push(description);
          textMap.push({ text: description, field: 'description' });
        }

        waypointDescriptions.forEach((desc, index) => {
          if (desc.trim()) {
            allTexts.push(desc);
            textMap.push({ text: desc, field: 'waypoint', waypointIndex: index });
          }
        });

        if (allTexts.length === 0) {
          setIsValidating(false);
          return true;
        }

        // Moderar todos los textos
        const results = await Promise.all(allTexts.map(text => moderateText(text)));

        // Procesar resultados
        let hasAnyInappropriateContent = false;
        const allFlaggedCategories: string[] = [];

        results.forEach((result, index) => {
          if (result.hasInappropriateContent) {
            hasAnyInappropriateContent = true;
            allFlaggedCategories.push(...result.flaggedCategories);

            const textInfo = textMap[index];
            const categoryNames = getCategoryDisplayNames(result.flaggedCategories);

            errors.push({
              field: textInfo.field,
              waypointIndex: textInfo.waypointIndex,
              message: `Contenido inapropiado detectado: ${categoryNames.join(', ')}`,
              categories: result.flaggedCategories,
            });
          }
        });

        // Crear flags de moderación si hay contenido inapropiado
        if (hasAnyInappropriateContent) {
          const combinedResult: ModerationResult = {
            scores: results.flatMap(r => r.scores),
            hasInappropriateContent: true,
            flaggedCategories: [...new Set(allFlaggedCategories)],
            maxProbability: Math.max(...results.map(r => r.maxProbability)),
          };

          const flags = createModerationFlags(combinedResult);
          setModerationFlags(flags);
        }

        setModerationErrors(errors);
        setHasInappropriateContent(hasAnyInappropriateContent);

        setIsValidating(false);
        return !hasAnyInappropriateContent;
      } catch (error) {
        console.error('Error en validación de contenido:', error);
        setIsValidating(false);

        // En caso de error, permitir continuar para no bloquear la funcionalidad
        return true;
      }
    },
    [clearErrors]
  );

  const validateImages = useCallback(async (images: File[]): Promise<boolean> => {
    if (!images || images.length === 0) {
      return true;
    }

    setIsValidating(true);
    setImageErrors([]);

    try {
      // Moderar cada imagen individualmente para errores precisos
      const perImageResults = await Promise.all(images.map(img => moderateImage(img)));

      const anyInappropriate = perImageResults.some(r => r.hasInappropriateContent);
      if (anyInappropriate) {
        const errors = createImageModerationErrors(
          perImageResults.filter(r => r.hasInappropriateContent)
        );
        setImageErrors(errors);
        setHasInappropriateContent(true);

        // Construir un resultado combinado para banderas agregadas
        const combined = await moderateMultipleImages(images);
        const imageFlags = createImageModerationFlags(combined);
        if (imageFlags) {
          setModerationFlags(imageFlags);
        }
      }

      setIsValidating(false);
      return !anyInappropriate;
    } catch (error) {
      console.error('Error en validación de imágenes:', error);
      setIsValidating(false);

      // En caso de error, permitir continuar para no bloquear la funcionalidad
      return true;
    }
  }, []);

  const getCategoryDisplayNames = (categories: string[]): string[] => {
    const categoryMap: Record<string, string> = {
      S: 'Contenido sexual',
      H: 'Discurso de odio',
      V: 'Violencia',
      HR: 'Acoso',
      SH: 'Autolesión',
      S3: 'Contenido sexual con menores',
      H2: 'Discurso de odio amenazante',
      V2: 'Violencia gráfica',
      OK: 'Contenido apropiado',
    };

    return categories.map(cat => categoryMap[cat] || cat);
  };

  return {
    isValidating,
    hasInappropriateContent,
    moderationErrors,
    moderationFlags,
    imageErrors,
    validateContent,
    validateImages,
    clearErrors,
    getErrorMessage,
  };
};
