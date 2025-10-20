import { useState, useCallback } from 'react';
import {
  moderateText,
  moderateMultipleTexts,
  createModerationFlags,
} from '@/services/moderation-service';
import { ModerationResult, ModerationFlags } from '@/types/moderation';

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
  validateContent: (
    title: string,
    description: string,
    waypointDescriptions: string[]
  ) => Promise<boolean>;
  clearErrors: () => void;
  getErrorMessage: () => string;
}

export const useContentModeration = (): UseContentModerationReturn => {
  const [isValidating, setIsValidating] = useState(false);
  const [hasInappropriateContent, setHasInappropriateContent] = useState(false);
  const [moderationErrors, setModerationErrors] = useState<ModerationError[]>([]);
  const [moderationFlags, setModerationFlags] = useState<ModerationFlags | null>(null);

  const clearErrors = useCallback(() => {
    setModerationErrors([]);
    setHasInappropriateContent(false);
    setModerationFlags(null);
  }, []);

  const getErrorMessage = useCallback((): string => {
    if (moderationErrors.length === 0) return '';

    const errorMessages = moderationErrors.map(error => {
      if (error.field === 'waypoint' && error.waypointIndex !== undefined) {
        return `Parada ${error.waypointIndex + 1}: ${error.message}`;
      }
      return `${error.field === 'title' ? 'Título' : 'Descripción'}: ${error.message}`;
    });

    return `Contenido inapropiado detectado:\n${errorMessages.join('\n')}`;
  }, [moderationErrors]);

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
    validateContent,
    clearErrors,
    getErrorMessage,
  };
};
