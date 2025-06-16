import {Heart, Eye, Share2, Edit3} from "lucide-react";
import { MoreVertical, Trash2 } from "lucide-react";
import mark from "@assets/iconslogo.svg";
import { Post } from "@/types";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {deletePostById} from "@/services/db-service.ts";
import ConfirmDialog from "../confirm-dialog/confirm-dialog";

interface CardProps {
  post: Post;
  variant?: "default" | "large";
  isEditable?: boolean;
  onDeleted?: (id: string) => void;
}

const Card = ({ post, variant = "default",isEditable }: CardProps) => {
  const { title, images, likes, likedBy } = post;
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Función para manejar el clic en la card y navegar al detalle del post
  const handleClick = () => {
    navigate(`/post/${post.id}`);
  };

  // Función para manejar la eliminación de la ruta
  const handleDeleteRoute = async (postId: string) => {
    try {
      await deletePostById(postId);
      console.log("Publicación eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar publicación:", error);
    }
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
    <>
      <div
        className={`relative ${sizeClasses} rounded-2xl overflow-hidden shadow-md shrink-0`}
        style={{
          backgroundImage: `url(${images?.[0] || "/placeholder.jpg"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        onClick={handleClick}
      >
        {isEditable && (
          <div className="absolute top-3 right-3 z-30">
            <button onClick={(e) => {
              e.stopPropagation(); // evitar que se dispare el navigate
              setShowOptions(prev => !prev);
            }}>
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

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => handleDeleteRoute(post.id)}
        title="Eliminar ruta"
        message="¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer."
      />
    </>
  );
};

export default Card;
