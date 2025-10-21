import {
  ImageModerationResult,
  ImageModerationError,
  SightengineResponse,
  ModerationScore,
  INAPPROPRIATE_IMAGE_CATEGORIES,
  IMAGE_MODERATION_THRESHOLD,
  InappropriateImageCategory,
} from '@/types/moderation';

const SIGHTENGINE_API_URL = 'https://api.sightengine.com/1.0/check.json';
const API_USER = import.meta.env.VITE_SIGHTENGINE_API_USER;
const API_SECRET = import.meta.env.VITE_SIGHTENGINE_API_SECRET;

// Modelos de Sightengine a usar
const SIGHTENGINE_MODELS =
  'nudity-2.1,alcohol,recreational_drug,medical,offensive-2.0,scam,text-content,face-attributes,gore-2.0,text,qr-content,tobacco,genai,violence,self-harm,money,gambling';

/**
 * Llama a la API de Sightengine para moderar una imagen
 */
const callSightengineAPI = async (file: File): Promise<SightengineResponse> => {
  if (!API_USER || !API_SECRET) {
    console.warn(
      'Moderación de imágenes: VITE_SIGHTENGINE_API_USER o VITE_SIGHTENGINE_API_SECRET no están configuradas, omitiendo llamada a Sightengine'
    );
    // Devolver un resultado "limpio" para no bloquear el flujo cuando falten las credenciales
    return {};
  }

  const formData = new FormData();
  formData.append('media', file);
  formData.append('models', SIGHTENGINE_MODELS);
  formData.append('api_user', API_USER);
  formData.append('api_secret', API_SECRET);

  const response = await fetch(SIGHTENGINE_API_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Error en la API de Sightengine: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * Procesa la respuesta de Sightengine y determina si el contenido es inapropiado
 */
const processImageModerationResponse = (
  response: SightengineResponse,
  imageName?: string
): ImageModerationResult => {
  const scores: ModerationScore[] = [];
  const flaggedCategories: string[] = [];
  let maxProbability = 0;

  // Procesar cada categoría en la respuesta
  for (const [category, data] of Object.entries(response)) {
    if (data && typeof data.prob === 'number') {
      const probability = data.prob;
      maxProbability = Math.max(maxProbability, probability);

      scores.push({
        label: category,
        probability,
      });

      // Verificar si es una categoría inapropiada y supera el umbral
      if (
        INAPPROPRIATE_IMAGE_CATEGORIES.includes(category as InappropriateImageCategory) &&
        probability > IMAGE_MODERATION_THRESHOLD
      ) {
        flaggedCategories.push(category);
      }
    }
  }

  const hasInappropriateContent = flaggedCategories.length > 0;

  return {
    scores,
    hasInappropriateContent,
    flaggedCategories,
    maxProbability,
    imageName,
  };
};

/**
 * Obtiene nombres de categorías en español para mostrar al usuario
 */
const getImageCategoryDisplayNames = (categories: string[]): string[] => {
  const categoryMap: Record<string, string> = {
    nudity: 'Contenido sexual',
    violence: 'Violencia',
    gore: 'Contenido violento/gore',
    offensive: 'Contenido ofensivo',
    recreational_drug: 'Drogas recreativas',
    self_harm: 'Autolesión',
    tobacco: 'Tabaco',
    alcohol: 'Alcohol',
    medical: 'Contenido médico',
    scam: 'Estafa',
    'text-content': 'Contenido de texto',
    'face-attributes': 'Atributos faciales',
    text: 'Texto',
    'qr-content': 'Código QR',
    genai: 'IA generativa',
    money: 'Dinero',
    gambling: 'Juego/apuestas',
  };

  return categories.map(cat => categoryMap[cat] || cat);
};

/**
 * Modera una imagen usando Sightengine
 */
export const moderateImage = async (file: File): Promise<ImageModerationResult> => {
  if (!file) {
    return {
      scores: [],
      hasInappropriateContent: false,
      flaggedCategories: [],
      maxProbability: 0,
      imageName: file.name,
    };
  }

  try {
    const response = await callSightengineAPI(file);
    return processImageModerationResponse(response, file.name);
  } catch (error) {
    console.error('Error en moderación de imagen:', error);

    // En caso de error, asumir contenido limpio para no bloquear la funcionalidad
    return {
      scores: [],
      hasInappropriateContent: false,
      flaggedCategories: [],
      maxProbability: 0,
      imageName: file.name,
    };
  }
};

/**
 * Valida múltiples imágenes y retorna el resultado combinado
 */
export const moderateMultipleImages = async (files: File[]): Promise<ImageModerationResult> => {
  if (!files || files.length === 0) {
    return {
      scores: [],
      hasInappropriateContent: false,
      flaggedCategories: [],
      maxProbability: 0,
    };
  }

  const results = await Promise.all(files.map(file => moderateImage(file)));

  // Combinar resultados
  const allFlaggedCategories = results.flatMap(result => result.flaggedCategories);
  const hasAnyInappropriateContent = results.some(result => result.hasInappropriateContent);
  const maxProbability = Math.max(...results.map(result => result.maxProbability));

  return {
    scores: results.flatMap(result => result.scores),
    hasInappropriateContent: hasAnyInappropriateContent,
    flaggedCategories: [...new Set(allFlaggedCategories)], // Eliminar duplicados
    maxProbability,
  };
};

/**
 * Crea errores de moderación para imágenes
 */
export const createImageModerationErrors = (
  results: ImageModerationResult[]
): ImageModerationError[] => {
  const errors: ImageModerationError[] = [];

  results.forEach(result => {
    if (result.hasInappropriateContent && result.imageName) {
      const categoryNames = getImageCategoryDisplayNames(result.flaggedCategories);
      errors.push({
        imageName: result.imageName,
        message: `Contenido inapropiado detectado: ${categoryNames.join(', ')}`,
        categories: result.flaggedCategories,
      });
    }
  });

  return errors;
};

/**
 * Crea flags de moderación para imágenes (similar a createModerationFlags para texto)
 */
export const createImageModerationFlags = (result: ImageModerationResult) => {
  if (!result.hasInappropriateContent) {
    return null;
  }

  return {
    status: 'flagged' as const,
    detectedCategories: result.flaggedCategories,
    maxProbability: result.maxProbability,
    flaggedAt: new Date().toISOString(),
    details: result.scores,
  };
};
