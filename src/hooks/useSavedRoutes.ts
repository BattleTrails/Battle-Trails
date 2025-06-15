import { useState, useEffect } from 'react';
import { saveRoute, unsaveRoute, isRouteSaved } from '@/services/db-service';
import { useAuthHandler } from '@/hooks/useAuthHandler';

const useSavedRoutes = (postId: string) => {
  const { user } = useAuthHandler();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar si la ruta está guardada al cargar
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user || !postId) return;
      
      try {
        const saved = await isRouteSaved(user.uid, postId);
        setIsSaved(saved);
      } catch (error) {
        console.error('Error al verificar si la ruta está guardada:', error);
      }
    };

    checkIfSaved();
  }, [user, postId]);

  // Función para alternar el estado guardado
  const toggleSave = async () => {
    if (!user || !postId) {
      console.warn('Usuario no autenticado o postId no válido');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isSaved) {
        await unsaveRoute(user.uid, postId);
        setIsSaved(false);
      } else {
        await saveRoute(user.uid, postId);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error al cambiar estado de guardado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSaved,
    isLoading,
    toggleSave,
    canSave: !!user && !!postId
  };
};

export default useSavedRoutes;