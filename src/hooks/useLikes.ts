// hooks/useLikes.ts
import { useState, useEffect } from 'react';
import { auth } from '@/config/firebaseConfig';
import { likePost, unlikePost, getPostLikes, hasUserLikedPost } from '@/services/db-service';
import { useAuthHandler } from '@/hooks/useAuthHandler';

interface UseLikesReturn {
  likes: number;
  isLiked: boolean;
  isLoading: boolean;
  toggleLike: () => Promise<void>;
  canLike: boolean;
}

const useLikes = (postId: string, initialLikes: number = 0): UseLikesReturn => {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [canLike, setCanLike] = useState(false);

  // Usar el hook de autenticación de Firebase
  const { user } = useAuthHandler();

  // Verificar si el usuario está autenticado y si ya le dio like al post
  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        // Verificar si el usuario está autenticado con Firebase
        if (user) {
          setCanLike(true);
          const userHasLiked = await hasUserLikedPost(postId, user.uid);
          setIsLiked(userHasLiked);
        } else {
          setCanLike(false);
          setIsLiked(false);
        }

        // Obtener el número actual de likes
        const currentLikes = await getPostLikes(postId);
        setLikes(currentLikes);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    if (postId) {
      checkLikeStatus();
    }
  }, [postId, user]); // Agregar user como dependencia

  const toggleLike = async () => {
    if (!canLike || isLoading) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Verificar que el usuario esté autenticado con Firebase
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      if (isLiked) {
        // Unlike
        await unlikePost(postId, user.uid);
        setLikes(prev => Math.max(0, prev - 1));
        setIsLiked(false);
      } else {
        // Like
        await likePost(postId, user.uid);
        setLikes(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('❌ Error toggling like:', error);
      // Aquí podrías mostrar un toast de error
    } finally {
      setIsLoading(false);
    }
  };

  return {
    likes,
    isLiked,
    isLoading,
    toggleLike,
    canLike
  };
};

export default useLikes;


