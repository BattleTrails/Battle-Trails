import { Bookmark, BookmarkCheck } from "lucide-react";
import useSavedRoutes from "@/hooks/useSavedRoutes";

interface SaveRouteButtonProps {
  postId: string;
}

const SaveRouteButton = ({ postId }: SaveRouteButtonProps) => {
  const { isSaved, isLoading, toggleSave, canSave } = useSavedRoutes(postId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    console.log('Botón clickeado:', { isSaved, postId, canSave }); // Debug
    await toggleSave();
  };

  if (!canSave) {
    return (
      <div className="p-2 rounded-full bg-gray-100 border border-gray-300 opacity-50 cursor-not-allowed">
        <Bookmark className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`p-2 rounded-full transition-all duration-200 border flex items-center gap-2 ${
        isSaved
          ? "bg-black text-white border-black shadow-md"
          : "bg-white text-gray-600 hover:bg-gray-100 border-none transition-all duration-300 ease-in-out"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      title={isSaved ? "Quitar de guardados" : "Guardar ruta"}
    >
      {isLoading ? (
        <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isSaved ? (
        <BookmarkCheck className="w-6 h-6 fill-current" />
      ) : (
        <Bookmark className="w-6 h-6" />
      )}
    </button>
  );
};

export default SaveRouteButton;