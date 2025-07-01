import {Heart, Eye, Share2, Edit3} from "lucide-react";
import { MoreVertical, Trash2 } from "lucide-react";
import mark from "@assets/iconslogo.svg";
import { Post } from "@/types";
import { useNavigate } from "react-router-dom";
import {useState} from "react";
import {deletePostById} from "@/services/db-service.ts";
import ConfirmDialog from "../confirm-dialog/confirm-dialog";
import useLikes from "@/hooks/useLikes";
import useViews from "@/hooks/useViews";

interface CardProps {
  post: Post;
  variant?: "default" | "large";
  isEditable?: boolean;
  onDeleted?: (id: string) => void;
}

const Card = ({ post, variant = "default", isEditable, onDeleted }: CardProps) => {
  const { title, images, likes: initialLikes } = post;
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Hook para manejar likes
  const { likes, isLiked, isLoading: isLikeLoading, toggleLike, canLike } = useLikes(
    post.id,
    initialLikes
  );

  // Hook para manejar vistas
  const { views } = useViews(post.id, post.views);

  // Función para manejar el clic en la card y navegar al detalle del post
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/post/${post.id}`);
  };

  // Función para manejar la eliminación de la ruta
  const handleDeleteRoute = async (postId: string) => {
    try {
      await deletePostById(postId);
      console.log("Publicación eliminada correctamente");
      onDeleted?.(postId);
    } catch (error) {
      console.error("Error al eliminar publicación:", error);
    }
  };

  // Función para manejar el like sin navegar
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('🖱️ Botón de like clickeado en Card');

    if (canLike && !isLikeLoading) {
      await toggleLike();
    } else {
      console.log('🚫 No se puede dar like:', { canLike, isLikeLoading });
    }
  };

  // Función para manejar compartir sin navegar
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();

    const url = `${window.location.origin}/post/${post.id}`;

    if (navigator.share) {
      navigator.share({
        title: post.title || 'Ruta interesante',
        text: post.description || 'Mira esta ruta que encontré',
        url: url,
      });
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(url);
      // Aquí podrías mostrar un toast de confirmación
    }
  };

  // Tamaños condicionales para que la card sea más grande en el post detalles
  const sizeClasses = variant === "large"
    ? "w-full h-[380px] max-w-[320px]"
    : "min-w-70 min-h-96";

  const titleClasses = variant === "large"
    ? "text-lg font-medium line-clamp-2"
    : "text-lg font-medium line-clamp-2";

  const locationClasses = variant === "large" 
    ? "text-sm" 
    : "text-sm";

  return (
    <div
      className={`relative ${sizeClasses} rounded-2xl overflow-hidden shadow-md shrink-0 cursor-pointer`}
      style={{
        backgroundImage: `url(${images?.[0] || "/placeholder.jpg"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={handleClick}
    >
      {isEditable && (
        <div className="absolute top-3 right-3 z-30">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowOptions(prev => !prev);
            }}
            className="p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all duration-200"
          >
            <MoreVertical className="text-white" size={20} />
          </button>

          {showOptions && (
            <div
              className="absolute right-0 mt-2 bg-white text-black text-sm shadow-lg rounded w-36 z-40"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setShowConfirmDialog(true);
                  setShowOptions(false);
                }}
                className="flex items-center gap-2 w-full rounded px-4 py-2 hover:bg-red-100 text-red-600"
              >
                <Trash2 size={16} /> Eliminar ruta
              </button>
              <button
                onClick={() => navigate(`/edit/${post.id}`)}
                className="flex items-center gap-2 w-full rounded px-4 py-2 hover:bg-blue-100 text-blue-600"
              >
                <Edit3 size={16} /> Editar ruta
              </button>
            </div>
          )}
        </div>
      )}
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />

      {/* Contenido */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 text-white">
        <div className="flex flex-col justify-center items-center mb-4 gap-4 text-center">
          <h2 className={titleClasses}>{title}</h2>
          <div className="flex w-full items-center gap-3">
            <img src={mark} alt="" className="h-5" />
            <p className={`${locationClasses} opacity-90 line-clamp-2 font-light`}>{post.locationName}</p>
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <div className="flex gap-4">
            <div className="flex items-center gap-1 font-light">
              <Eye size={18} strokeWidth={1} /> {views}
            </div>
            <div
              className="flex items-center gap-1 font-light cursor-pointer"
              onClick={handleLike}
              title={canLike ? (isLiked ? 'Quitar like' : 'Dar like') : 'Inicia sesión para dar like'}
            >
              <Heart
                size={18}
                strokeWidth={1}
                className={`transition-all duration-200 ${isLiked ? 'fill-current text-red-500' : 'text-white'
                  } ${!canLike ? 'opacity-50' : 'hover:text-red-300'} ${isLikeLoading ? 'opacity-50' : ''
                  }`}
              />
              <span className={isLikeLoading ? 'opacity-50' : ''}>{likes}</span>
            </div>
          </div>
          <button
            onClick={handleShare}
            className="hover:text-gray-300 transition-colors p-1"
            title="Compartir ruta"
          >
            <Share2 size={18} strokeWidth={1} />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => {
          handleDeleteRoute(post.id);
          setShowConfirmDialog(false);
        }}
        title="Eliminar ruta"
        message="¿Estás seguro de que quieres eliminar esta ruta? Esta acción no se puede deshacer."
      />
    </div>
  );
};

export default Card;