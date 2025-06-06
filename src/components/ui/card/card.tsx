import { Heart, Eye, Share2 } from "lucide-react";
import mark from "@assets/iconslogo.svg";
import { Post } from "@/types";
import {useNavigate} from "react-router-dom";

interface CardProps {
  post: Post;
  variant?: "default" | "large";
}

const Card = ({ post, variant = "default" }: CardProps) => {
  const { title, images, likes, likedBy } = post;
  const navigate = useNavigate();

  // Función para manejar el clic en la card y navegar al detalle del post
  const handleClick = () => {
    navigate(`/post/${post.id}`);
  };

  // Tamaños condicionales para que la card sea más grande en el post detalles
  const sizeClasses =
  variant === "large"
    ? "w-full h-[500px] max-w-[380px]" 
    : "min-w-70 min-h-96";

  const titleClasses =
    variant === "large"
      ? "text-xl font-medium line-clamp-2"
      : "text-lg font-medium line-clamp-2";

  const locationClasses =
    variant === "large" ? "text-base" : "text-sm";

  return (
    <div
      className={`relative ${sizeClasses} rounded-2xl overflow-hidden shadow-md shrink-0`}
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
          <div className="flex w-full items-center gap-3">
            <img src={mark} alt="" className="h-5" />
            <p className={`${locationClasses} opacity-90 line-clamp-2 font-light`}>{post.locationName}</p>
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <div className="flex gap-4">
            <div className="flex items-center gap-1 font-light">
              <Eye size={18} strokeWidth={1} /> {likedBy.length}
            </div>
            <div className="flex items-center gap-1 font-light">
              <Heart size={18} strokeWidth={1} /> {likes}
            </div>
          </div>
          <Share2 size={18} strokeWidth={1} />
        </div>
      </div>
    </div>
  );
};

export default Card;
