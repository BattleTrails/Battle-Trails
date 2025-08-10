import { Bookmark, BookmarkCheck } from "lucide-react";
import useSavedRoutes from "@/hooks/useSavedRoutes";
import { useState } from "react";
import LoginModal from "../login-modal/login-modal";

interface SaveRouteButtonProps {
  postId: string;
  onShowLoginModal?: () => void;
}

const SaveRouteButton = ({ postId, onShowLoginModal }: SaveRouteButtonProps) => {
  const { isSaved, isLoading, toggleSave, canSave } = useSavedRoutes(postId);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    if (!canSave) {
      if (onShowLoginModal) {
        onShowLoginModal();
      } else {
        setShowLoginModal(true);
      }
      return;
    }
    
    console.log('Botón clickeado:', { isSaved, postId, canSave }); // Debug
    await toggleSave();
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`p-2 rounded-full transition-all duration-200 ${
          isSaved
            ? "text-yellow-500 hover:bg-yellow-50"
            : "text-gray-600 hover:bg-yellow-100"
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

      {!onShowLoginModal && (
        <LoginModal 
          showModal={showLoginModal} 
          setShowModal={setShowLoginModal}
          title="Inicia sesión para guardar"
          message="Necesitas iniciar sesión para guardar esta ruta en tus favoritos."
        />
      )}
    </>
  );
};

export default SaveRouteButton;