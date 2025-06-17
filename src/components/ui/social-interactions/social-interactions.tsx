import { Share2, Heart, Eye } from "lucide-react";
import useLikes from "@/hooks/useLikes";
import useViews from "@/hooks/useViews";
import SaveRouteButton from "@/components/ui/save-route-button/save-route-button";
import { useEffect } from "react";

interface SocialInteractionsProps {
    postId: string;
    initialLikes: number;
    initialViews: number;
    onShowLoginModal: (title: string, message: string) => void;
}

const SocialInteractions = ({ postId, initialLikes, initialViews, onShowLoginModal }: SocialInteractionsProps) => {
    const { likes, isLiked, isLoading: isLikeLoading, toggleLike, canLike } = useLikes(
        postId,
        initialLikes
    );

    const { views, incrementView } = useViews(postId, initialViews);

    // Incrementar vistas solo una vez cuando se monta el componente
    useEffect(() => {
        const incrementViewsOnce = async () => {
            if (postId) {
                await incrementView();
            }
        };
        
        incrementViewsOnce();
    }, [postId, incrementView]);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Ruta interesante',
                text: 'Mira esta ruta que encontré',
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (canLike && !isLikeLoading) {
            await toggleLike();
        } else {
            onShowLoginModal(
                "Inicia sesión para dar like",
                "Necesitas iniciar sesión para poder dar like a esta ruta."
            );
        }
    };

    return (
        <div className="flex gap-x-2 mb-6 items-center justify-between">
            <div className="flex gap-x-4">
                <button
                    onClick={handleShare}
                    className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300 ease-in-out"
                    title="Compartir ruta"
                >
                    <Share2 className="w-6 h-6" />
                </button>

                <SaveRouteButton 
                    postId={postId} 
                    onShowLoginModal={() => {
                        onShowLoginModal(
                            "Inicia sesión para guardar",
                            "Necesitas iniciar sesión para guardar esta ruta en tus favoritos."
                        );
                    }}
                />
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="w-5 h-5" />
                    <span className="text-sm font-medium">{views}</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleLike}
                        disabled={isLikeLoading}
                        className={`p-2 rounded-full transition-all duration-200 ${
                            canLike ? 'hover:bg-red-50 cursor-pointer' : 'cursor-pointer'
                        } ${isLiked ? 'text-red-500' : 'text-gray-600'}`}
                        title={canLike ? (isLiked ? 'Quitar like' : 'Dar like') : 'Inicia sesión para dar like'}
                    >
                        <Heart
                            className={`w-6 h-6 transition-all duration-200 ${isLiked ? 'fill-current' : ''
                                } ${isLikeLoading ? 'opacity-50' : ''}`}
                        />
                    </button>
                    <span className="text-sm font-medium">{likes}</span>
                </div>
            </div>
        </div>
    );
};

export default SocialInteractions; 