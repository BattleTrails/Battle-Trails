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
