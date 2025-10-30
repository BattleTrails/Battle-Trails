import {
  ModerationResult,
  ModerationScore,
  ModerationFlags,
  INAPPROPRIATE_CATEGORIES,
  MODERATION_THRESHOLD,
  ModerationCategory,
} from '@/types/moderation';

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/KoalaAI/Text-Moderation';
const API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;

interface HuggingFaceResponse {
  label: string;
  score: number;
}

// --- Heurística rápida para español (bloqueo inmediato si coincide) ---
// Normaliza texto (minúsculas y sin acentos)
const normalizeText = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

// Lista mínima de términos/expresiones en español por categoría sensible
// Nota: esta lista puede ampliarse; empezamos por casos claros
const SPANISH_BLOCKLIST: Array<{ pattern: RegExp; category: 'S' | 'H' | 'V' | 'HR' }> = [
  // Sexual (S)
  {
    pattern:
      /\b(polla|polla\s+dura|verga|pene|co?\s*no|chocho|follar|mamada|chupar\s+(polla|verga)|sexo\s+expl\w*|porn[oó])\b/,
    category: 'S',
  },
  // Harassment (HR) y Hate (H) ejemplos básicos (no exhaustivo)
  { pattern: /\b(puta|gilipollas|mierda|imbecil|idiota|cabrones?|cabroncitos?)\b/, category: 'HR' },
  // Violence (V)
  { pattern: /\b(matarte|te\s+voy\s+a\s+matar|asesinar|te\s+pego|paliza)\b/, category: 'V' },
];

const heuristicModeration = (text: string): ModerationResult | null => {
  if (!text) return null;
  const t = normalizeText(text);
  const matchedCategories = new Set<string>();

  for (const { pattern, category } of SPANISH_BLOCKLIST) {
    if (pattern.test(t)) {
      matchedCategories.add(category);
    }
  }

  // --- Fallback por palabras prohibidas (lista de emergencia) ---
  // Mapeo de categorías del JSON -> categorías del modelo
  const EMERGENCY_CATEGORY_MAP: Record<string, ModerationCategory> = {
    general_toxicity: 'HR',
    insults_aggression: 'HR',
    sexual_content: 'S',
    hate_discrimination: 'H',
    violence_threats: 'V',
    harassment_bullying: 'HR',
    drugs_alcohol: 'HR',
    self_harm_suicide: 'SH',
    spam_scam: 'HR',
  };

  // Lista compacta tomada del JSON de emergencia del usuario
  const FORBIDDEN_EMERGENCY: Record<string, string[]> = {
    general_toxicity: [
      'idiot',
      'stupid',
      'tonto',
      'imbécil',
      'm***da',
      'basura',
      'cállate',
      'shut up',
      'moron',
      'fool',
      'dumb',
      'useless',
      'inútil',
    ],
    insults_aggression: [
      'a**hole',
      'b*****d',
      'sucker',
      'p***',
      'imbécil',
      'payaso',
      'estúpido',
      'idiota',
      'loser',
      'cretino',
      'jack***',
      'estúpida',
      'idiotic',
      'trash',
      'pendej*',
      'gilip***as',
    ],
    sexual_content: [
      's*x',
      'porn',
      'porno',
      'f***',
      'c***',
      'boobs',
      't***s',
      'naked',
      'desnudo',
      'n*de',
      'p***y',
      'orgasm',
      'masturb*',
      'sexo',
      'pene',
      'vagina',
      'pechos',
      'tetas',
    ],
    hate_discrimination: [
      'racist',
      'racismo',
      'n****',
      'homophobe',
      'homofobia',
      'xenofobia',
      'sexista',
      'machista',
      'antisemitic',
      'islamophobia',
      'maric*n',
      'p**to',
      'negro de m***',
      'feminazi',
    ],
    violence_threats: [
      'kill you',
      'matarte',
      'te voy a matar',
      'shoot you',
      'golpearte',
      'pegarte',
      'te voy a golpear',
      'burn you',
      'apuñalar',
      // Nota: se excluyen términos neutros del contexto histórico (p. ej., 'arma', 'pistola', 'bomba', 'explosión')
    ],
    harassment_bullying: [
      'nobody likes you',
      'eres un fracaso',
      'go die',
      'muérete',
      'vete al infierno',
      'te odio',
      'odio tu cara',
      'die loser',
      'perdedor',
      'odioso',
      'asqueroso',
      'repugnante',
      'te detesto',
    ],
    drugs_alcohol: [
      'cocaine',
      'heroine',
      'weed',
      'marihuana',
      'joint',
      'crack',
      'alcoholic',
      'borracho',
      'drogadicto',
      'pastilla',
      'lsd',
      'meth',
      'ketamine',
    ],
    self_harm_suicide: [
      'kill myself',
      'suicide',
      'suicidarme',
      'me quiero morir',
      'self harm',
      'cortarme',
      'me voy a matar',
      'no quiero vivir',
      'odio mi vida',
      'desaparecer',
      'morirme',
    ],
    spam_scam: [
      'click here',
      'haz clic aquí',
      'win money',
      'gana dinero rápido',
      'free bitcoin',
      'link gratis',
      'promo exclusiva',
      'inversión milagrosa',
      'hazte rico',
      'sin esfuerzo',
      'only today',
      'solo hoy',
      'recompensa instantánea',
    ],
  };

  // Construir RegExp tolerante a asteriscos y espacios, sin acentos
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, r => `\\${r}`);
  // Reemplaza asteriscos por \S* (cualquier secuencia sin espacios)
  const wildcardify = (s: string) => escapeRegex(s).replace(/\\\*+/g, '\\S*');
  const buildWordRegex = (term: string) => {
    // Queremos buscar por palabra; usamos \b pero también consideramos términos con espacios
    const pattern = wildcardify(normalizeText(term));
    return new RegExp(`(^|[^a-záéíóúñ])(${pattern})(?=$|[^a-záéíóúñ])`, 'i');
  };

  for (const [group, words] of Object.entries(FORBIDDEN_EMERGENCY)) {
    const label = EMERGENCY_CATEGORY_MAP[group] as ModerationCategory | undefined;
    if (!label) continue;
    for (const w of words) {
      const re = buildWordRegex(w);
      if (re.test(t)) {
        matchedCategories.add(label);
        break; // con una coincidencia en el grupo basta
      }
    }
  }

  if (matchedCategories.size === 0) return null;

  const categories = Array.from(matchedCategories);
  const scores: ModerationScore[] = categories.map(label => ({ label, probability: 1 }));

  return {
    scores,
    hasInappropriateContent: true,
    flaggedCategories: categories,
    maxProbability: 1,
  };
};

/**
 * Llama a la API de HuggingFace para moderar texto
 */
const callHuggingFaceAPI = async (text: string): Promise<HuggingFaceResponse[]> => {
  if (!API_KEY) {
    console.warn(
      'Moderación: VITE_HUGGINGFACE_API_KEY no está configurada, omitiendo llamada a HuggingFace'
    );
    // Devolver un resultado "OK" para no bloquear el flujo cuando falte la API key
    return [{ label: 'OK', score: 1 }];
  }

  const response = await fetch(HUGGINGFACE_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: text }),
  });

  if (!response.ok) {
    throw new Error(`Error en la API de HuggingFace: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // La API puede devolver un array o un objeto único
  if (Array.isArray(data)) {
    return data[0];
  }

  return data;
};

/**
 * Procesa la respuesta de HuggingFace y determina si el contenido es inapropiado
 */
const processModerationResponse = (scores: HuggingFaceResponse[]): ModerationResult => {
  const ALL_CATEGORIES: readonly ModerationCategory[] = [
    'S',
    'H',
    'V',
    'HR',
    'SH',
    'S3',
    'H2',
    'V2',
    'OK',
  ] as const;
  const isModerationCategory = (label: string): label is ModerationCategory =>
    (ALL_CATEGORIES as readonly string[]).includes(label);

  const moderationScores: ModerationScore[] = scores.map(item => ({
    label: item.label,
    probability: item.score,
  }));

  // Encontrar categorías inapropiadas que superen el umbral
  const flaggedCategories = moderationScores
    .filter(
      score =>
        isModerationCategory(score.label) &&
        INAPPROPRIATE_CATEGORIES.includes(score.label) &&
        score.probability > MODERATION_THRESHOLD
    )
    .map(score => score.label);

  const hasInappropriateContent = flaggedCategories.length > 0;
  const maxProbability = Math.max(...moderationScores.map(score => score.probability));

  return {
    scores: moderationScores,
    hasInappropriateContent,
    flaggedCategories,
    maxProbability,
  };
};

/**
 * Modera un texto usando el modelo KoalaAI/Text-Moderation
 */
export const moderateText = async (text: string): Promise<ModerationResult> => {
  if (!text || text.trim().length === 0) {
    return {
      scores: [],
      hasInappropriateContent: false,
      flaggedCategories: [],
      maxProbability: 0,
    };
  }

  try {
    // 1) Heurística española (bloqueo inmediato si coincide)
    const heuristic = heuristicModeration(text);
    if (heuristic) {
      return heuristic;
    }

    // 2) Modelo KoalaAI (inglés)
    const response = await callHuggingFaceAPI(text);
    return processModerationResponse(response);
  } catch (error) {
    console.error('Error en moderación de texto:', error);

    // En caso de error, asumir contenido limpio para no bloquear la funcionalidad
    return {
      scores: [],
      hasInappropriateContent: false,
      flaggedCategories: [],
      maxProbability: 0,
    };
  }
};

/**
 * Crea flags de moderación para almacenar en la base de datos
 */
export const createModerationFlags = (result: ModerationResult): ModerationFlags | null => {
  if (!result.hasInappropriateContent) {
    return null;
  }

  return {
    status: 'flagged',
    detectedCategories: result.flaggedCategories,
    maxProbability: result.maxProbability,
    flaggedAt: new Date().toISOString(),
    details: result.scores,
  };
};

/**
 * Valida múltiples textos y retorna el resultado combinado
 */
export const moderateMultipleTexts = async (texts: string[]): Promise<ModerationResult> => {
  const results = await Promise.all(texts.map(text => moderateText(text)));

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
