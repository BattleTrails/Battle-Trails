import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY!;

// Crear cliente de Supabase con configuración básica
export const supabase = createClient(supabaseUrl, supabaseKey);

// Función para obtener headers con token de Firebase para RLS
export const getAuthHeaders = async () => {
  const { auth } = await import('./firebaseConfig');
  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken();
    return {
      Authorization: `Bearer ${token}`,
      'X-Client-Info': 'supabase-js-web',
    };
  }

  return {};
};
