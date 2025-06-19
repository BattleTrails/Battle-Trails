import { useState, useEffect, useCallback } from 'react';
import { incrementPostViewsUnique, getPostViews, hasUserViewedPost } from '@/services/db-service';
import { useAuthHandler } from '@/hooks/useAuthHandler';

interface UseViewsReturn {
  views: number;
  isLoading: boolean;
  incrementView: () => Promise<void>;
}

const useViews = (postId: string, initialViews?: number): UseViewsReturn => {
  const [views, setViews] = useState<number>(initialViews || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const { user } = useAuthHandler();

  // Check if user has already viewed the post in this session
  useEffect(() => {
    const checkIfViewed = async () => {
      if (!postId) return;
      
      try {
        // Solo para usuarios autenticados
        if (!user) {
          setHasViewed(true); // Para que no intente incrementar
          const currentViews = await getPostViews(postId);
          setViews(currentViews);
          return;
        }
        // Check session storage first
        const sessionKey = `viewed_${postId}_${user.uid}`;
        const hasViewedInSession = sessionStorage.getItem(sessionKey);
        
        if (hasViewedInSession) {
          setHasViewed(true);
          const currentViews = await getPostViews(postId);
          setViews(currentViews);
          return;
        }

        // If not in session, check database
        const userId = user.uid;
        const viewed = await hasUserViewedPost(postId, userId);
        setHasViewed(viewed);
        
        if (viewed) {
          sessionStorage.setItem(sessionKey, 'true');
        }
        
        // Load current views
        const currentViews = await getPostViews(postId);
        setViews(currentViews);
      } catch (error) {
        console.error('❌ Error al verificar vista:', error);
      }
    };

    checkIfViewed();
  }, [postId, user]);

  const incrementView = useCallback(async () => {
    // Solo usuarios autenticados pueden incrementar
    if (!postId || hasViewed || isLoading || !user) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userId = user.uid;
      const result = await incrementPostViewsUnique(postId, userId);
      
      if (result.incremented) {
        setViews(result.views);
        setHasViewed(true);
        // Store in session storage
        sessionStorage.setItem(`viewed_${postId}_${user.uid}`, 'true');
      } else {
        setViews(result.views);
        setHasViewed(true);
        sessionStorage.setItem(`viewed_${postId}_${user.uid}`, 'true');
      }
      
    } catch (error) {
      console.error('❌ Error al incrementar vistas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [postId, hasViewed, isLoading, user]);

  return {
    views,
    isLoading,
    incrementView
  };
};

export default useViews;