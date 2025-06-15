import { Bookmark, Eye, Share2, Heart } from "lucide-react";
import mark from "@assets/iconslogo.svg";
import { Post } from "@/types";
import { useNavigate } from "react-router-dom";
import useLikes from "@/hooks/useLikes";
import useViews from "@/hooks/useViews"; // ✅ Importar useViews

interface CardProps {
  post: Post;
  variant?: "default" | "large";
}

const Card = ({ post, variant = "default" }: CardProps) => {
  const { title, images, likes: initialLikes, likedBy } = post;
  const navigate = useNavigate();

  // Hook para manejar likes - usar los likes actualizados del hook
  const { likes, isLiked, isLoading: isLikeLoading, toggleLike, canLike } = useLikes(
    post.id,
    initialLikes
  );

  // ✅ Hook para manejar vistas
  const { views } = useViews(post.id, post.views);

  // Función para manejar el clic en la card y navegar al detalle del post
  const handleClick = () => {
    navigate(`/post/${post.id}`);
  };

  // Función para manejar el like sin navegar
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Evitar navegación al hacer clic en like

    console.log('🖱️ Botón de like clickeado en Card');

    if (canLike && !isLikeLoading) {
      await toggleLike();
    } else {
      console.log('🚫 No se puede dar like:', { canLike, isLikeLoading });
    }
  };

  // Función para manejar compartir sin navegar
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar navegación al hacer clic en share

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
  const sizeClasses =
    variant === "large"
      ? "w-full h-[500px] max-w-[380px]"
      : "min-w-70 min-h-96";

  const titleClasses =
    variant === "large"
      ? "text-xl font-bold line-clamp-2"
      : "text-lg font-semibold line-clamp-2";

  const locationClasses =
    variant === "large" ? "text-base" : "text-sm";

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
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />

      {/* Contenido */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 text-white">
        <div className="flex flex-col justify-center items-center mb-4 gap-4 text-center">
          <h2 className={titleClasses}>{title}</h2>
          <div className="flex items-center gap-3">
            <img src={mark} alt="" className="h-5" />
            <p className={`${locationClasses} opacity-90 line-clamp-2 font-light`}>
              {post.locationName}
            </p>
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <div className="flex gap-4">
            {/* ✅ Mostrar vistas reales usando el hook */}
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
    </div>
  );
};

export default Card;