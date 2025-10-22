export interface ModerationScore {
  label: string;
  probability: number;
}

export interface ModerationResult {
  scores: ModerationScore[];
  hasInappropriateContent: boolean;
  flaggedCategories: string[];
  maxProbability: number;
}

export interface ModerationFlags {
  status: 'flagged' | 'clean';
  detectedCategories: string[];
  maxProbability: number;
  flaggedAt: string;
  details: ModerationScore[];
}

export type ModerationCategory = 'S' | 'H' | 'V' | 'HR' | 'SH' | 'S3' | 'H2' | 'V2' | 'OK';

export const INAPPROPRIATE_CATEGORIES: ModerationCategory[] = [
  'S',
  'H',
  'V',
  'HR',
  'SH',
  'S3',
  'H2',
  'V2',
];

export const MODERATION_THRESHOLD = 0.5;

// --- Interfaces para moderación de imágenes con Sightengine ---

export interface SightengineResponse {
  [key: string]: {
    prob: number;
    confidence: number;
  };
}

export interface ImageModerationResult {
  scores: ModerationScore[];
  hasInappropriateContent: boolean;
  flaggedCategories: string[];
  maxProbability: number;
  imageName?: string;
}

export interface ImageModerationError {
  imageName: string;
  message: string;
  categories: string[];
}

// Categorías de imagen consideradas inapropiadas
export const INAPPROPRIATE_IMAGE_CATEGORIES = [
  'nudity',
  'violence',
  'gore',
  'offensive',
  'recreational_drug',
  'self-harm',
  'tobacco',
  'alcohol',
  'medical',
  'scam',
  'text-content',
  'face-attributes',
  'text',
  'qr-content',
  'genai',
  'money',
  'gambling',
] as const;

export type InappropriateImageCategory = (typeof INAPPROPRIATE_IMAGE_CATEGORIES)[number];

export const IMAGE_MODERATION_THRESHOLD = 0.5;
