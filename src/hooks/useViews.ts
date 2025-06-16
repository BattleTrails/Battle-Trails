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

  // Check if user has already viewed the post
  useEffect(() => {
    const checkIfViewed = async () => {
      if (!postId) return;
      
      try {
        const userId = user?.uid || getOrCreateVisitorId();
        const viewed = await hasUserViewedPost(postId, userId);
        setHasViewed(viewed);
        
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
    if (!postId || hasViewed || isLoading) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userId = user?.uid || getOrCreateVisitorId();
      const result = await incrementPostViewsUnique(postId, userId);
      
      if (result.incremented) {
        setViews(result.views);
        setHasViewed(true);
      } else {
        setViews(result.views);
        setHasViewed(true);
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

// Helper function to get or create visitor ID
const getOrCreateVisitorId = (): string => {
  const STORAGE_KEY = 'unique_visitor_id';
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return stored;
  }
  
  const fingerprint = generateBrowserFingerprint();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  
  const visitorId = `visitor_${fingerprint}_${timestamp}_${random}`;
  localStorage.setItem(STORAGE_KEY, visitorId);
  
  return visitorId;
};

// Helper function to generate browser fingerprint
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
  
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
};

export default useViews;