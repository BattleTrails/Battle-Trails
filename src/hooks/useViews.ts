import { useState, useEffect, useCallback } from 'react';
import { incrementPostViewsUnique, getPostViews } from '@/services/db-service';
import { useAuthHandler } from '@/hooks/useAuthHandler';

interface UseViewsReturn {
  views: number;
  isLoading: boolean;
  incrementView: () => Promise<void>;
}

const useViews = (postId: string, initialViews?: number): UseViewsReturn => {
  const [views, setViews] = useState<number>(initialViews || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasIncremented, setHasIncremented] = useState(false);
  const { user } = useAuthHandler(); // Obtener el usuario actual

  // Cargar las vistas actuales del post al montar el componente
  useEffect(() => {
    const loadViews = async () => {
      if (!postId) return;
      
      try {
        setIsLoading(true);
        
        // Si no tenemos initialViews, obtener las vistas actuales de la BD
        if (initialViews === undefined) {
          const currentViews = await getPostViews(postId);
          setViews(currentViews);
        } else {
          setViews(initialViews);
        }
      } catch (error) {
        console.error('❌ Error al cargar vistas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadViews();
  }, [postId, initialViews]);

  // Función para incrementar las vistas (solo una vez por usuario)
  const incrementView = useCallback(async () => {
    if (!postId || hasIncremented) {
      console.log('Vista ya incrementada en este render');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Generar un ID único para el usuario (autenticado o visitante)
      const userId = user?.uid || getOrCreateVisitorId();
      
      console.log('👀 Intentando registrar vista para:', { 
        postId, 
        userId: userId.substring(0, 12) + '...',
        isAuthenticated: !!user 
      });
      
      // Intentar incrementar la vista (la función verificará si ya existe)
      const result = await incrementPostViewsUnique(postId, userId);
      
      if (result.incremented) {
        // Vista nueva registrada
        setViews(result.views);
        setHasIncremented(true);
        console.log('✅ Nueva vista registrada, total:', result.views);
      } else {
        // Usuario ya había visto este post
        setViews(result.views);
        console.log('👀 Usuario ya había visto este post, total views:', result.views);
      }
      
    } catch (error) {
      console.error('❌ Error al incrementar vistas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [postId, hasIncremented, user]);

  // Reset hasIncremented cuando cambia el postId
  useEffect(() => {
    setHasIncremented(false);
  }, [postId]);

  return {
    views,
    isLoading,
    incrementView
  };
};

// Función para obtener o crear un ID único para visitantes no autenticados
const getOrCreateVisitorId = (): string => {
  const STORAGE_KEY = 'unique_visitor_id';
  
  // Intentar obtener de localStorage primero
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    console.log('👤 Usando visitor ID existente:', stored.substring(0, 12) + '...');
    return stored;
  }
  
  // Generar nuevo ID único basado en características del dispositivo/navegador
  const fingerprint = generateBrowserFingerprint();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  
  const visitorId = `visitor_${fingerprint}_${timestamp}_${random}`;
  
  // Guardar en localStorage para futuras visitas
  localStorage.setItem(STORAGE_KEY, visitorId);
  
  console.log('👤 Nuevo visitor ID creado:', visitorId.substring(0, 12) + '...');
  return visitorId;
};

// Función para generar una huella digital del navegador
const generateBrowserFingerprint = (): string => {
  const components = [
    navigator.userAgent || '',
    navigator.language || '',
    screen.width + 'x' + screen.height,
    screen.colorDepth || '',
    new Date().getTimezoneOffset().toString(),
    navigator.platform || '',
    navigator.cookieEnabled ? '1' : '0'
  ];
  
  const fingerprint = components.join('|');
  
  // Crear hash simple
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
};

export default useViews;